<?php
$GLOBALS['AI']['talk'] = [
    "system_instruction" => ["parts" => array()],
    "contents" => array()
];

function loadIn_AI_models($SQL, $WHERE = ''){
    if(isset($_GET['id']) && $_GET['id'] != ''){ $WHERE = "AND id = {$_GET['id']} LIMIT 1"; }
    $A = $SQL->query("
        SELECT * 
        FROM ai 
        WHERE 
            FIND_IN_SET('{$_SESSION['user_id']}', share) > 0 
            $WHERE
        ");
    if(!$A || $A->num_rows == 0){ return []; }
    while ($B = $A->fetch_assoc()){
        $B['answer_parse'] = explode(',', $B['answer_parse']);
        $arr[] = $B;
    }
    return $arr;
}

function wakeUp_AI(){
    if(!isset($GLOBALS["config"]["API"]['geminiAPI'])){ return false; }
	$ch = curl_init();
    $api = $GLOBALS["config"]["API"]['geminiAPI'];
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_URL, "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=".$api);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
    $GLOBALS['AI']['curl'] = $ch;
    return true;
}

function generate_instruction($text){
    array_push($GLOBALS['AI']['talk']['system_instruction']['parts'], [
        "text" => $text
    ]);
}

function generate_talk_history(){
    if(!isset($_POST['history']) || !is_array($_POST['history'])){ return; }
    foreach($_POST['history'] as $v){ generate_talk($v['text'], $v['role']); }
}

function generate_talk($text, $role = 'user'){
	if($role != 'model'){ $role = 'user'; }
	array_push($GLOBALS['AI']['talk']['contents'], [
        "role" => $role,
        "parts" => [["text" => $text]]
    ]);
}

function ask_AI(){
	curl_setopt($GLOBALS['AI']['curl'], CURLOPT_POSTFIELDS, json_encode($GLOBALS['AI']['talk']));
	$response = curl_exec($GLOBALS['AI']['curl']);
	if(curl_errno($GLOBALS['AI']['curl'])){
        curl_close($GLOBALS['AI']['curl']);
        return false;
    }
    return clean_AI_response($response);
}

function clean_AI_response($raw_response){
    // 1. Decode the JSON response into an associative array
    $data = json_decode($raw_response, true);

    // 2. Check if JSON decoding failed
    if (json_last_error() !== JSON_ERROR_NONE) {
        return AI_err('System Error: Could not decode AI response.'); 
    }

    // 3. Check if the API returned an actual error (e.g., Invalid Key, Overloaded)
    if (isset($data['error'])) {
        return AI_err("API Error: " . ($data['error']['message'] ?? 'Unknown API error'));
    }

    if (isset($data['candidates'][0]['content']['parts'])) {
        $combined_text = '';
        $parts = $data['candidates'][0]['content']['parts'];

        // Iterate through all parts in the response
        foreach ($parts as $part) {
            // Check if the current part contains text
            if (isset($part['text'])) {
                $combined_text .= $part['text'];
            }
        }
        
        // If text was found, process it and return.
        if (!empty($combined_text)) {
            $combined_text = trim($combined_text);
            return json_encode(parse_AI_markdown($combined_text));
        }
    }

    // 5. Handle cases where safety filters blocked the content
    if (isset($data['candidates'][0]['finishReason']) && $data['candidates'][0]['finishReason'] !== 'STOP') {
        return AI_err("Response blocked. Reason: " . $data['candidates'][0]['finishReason']);
    }

    // 6. Fallback
    return AI_err("Error: No content generated.");
}

function parse_AI_markdown($text) {
    // 1. Security: Escape existing HTML to prevent XSS attacks
    // This ensures <script> tags in the AI response aren't executed.
    $text = htmlspecialchars($text, ENT_QUOTES, 'UTF-8');

    // 2. Blockquotes (> text)
    $text = preg_replace('/^> (.*?)$/m', '<blockquote>$1</blockquote>', $text);

    // 3. Code Blocks (```language ... ```)
    // We use a callback to wrap it in <pre><code>
    $text = preg_replace_callback('/```(\w*)(.*?)```/s', function($matches) {
        return '<pre><code class="language-' . $matches[1] . '">' . $matches[2] . '</code></pre>';
    }, $text);

    // 4. Inline Code (`variable`)
    $text = preg_replace('/`(.*?)`/', '<code>$1</code>', $text);

    // 5. Bold (**text**)
    $text = preg_replace('/\*\*(.*?)\*\*/', '<strong>$1</strong>', $text);

    // 6. Italic (*text*)
    $text = preg_replace('/\*(.*?)\*/', '<em>$1</em>', $text);

    // 7. Headers (### Text)
    // (Gemini usually goes up to H3)
    $text = preg_replace('/^### (.*?)$/m', '<h3>$1</h3>', $text);
    $text = preg_replace('/^## (.*?)$/m', '<h2>$1</h2>', $text);
    $text = preg_replace('/^# (.*?)$/m', '<h1>$1</h1>', $text);

    // 8. Unordered Lists (* Item or - Item)
    // This converts lines starting with * or - into list items
    $text = preg_replace('/^\s*[\-\*] (.*?)$/m', '<li>$1</li>', $text);

    // Note: Strictly creating <ul> wrappers with Regex is difficult. 
    // For a simple chat, styling <li> to have a margin-left is usually enough.

    return $text;
}

function AI_err($str = 'error'){ return json_encode(['error' => $str]); }

// make a simple user table design

function run_AI(){

    // $t = '```json { "sql": "SELECT user_id, user_username, user_email, user_role_id FROM user;" } ``` **test** test 2';
    // return json_encode(parse_AI_markdown($t));

    if(!isset($_POST['ask']) || $_POST['ask'] == ''){ return AI_err('Empty_message'); }
	if(!wakeUp_AI()){ return AI_err('Oktagon_AI_not_available'); }

    if(isset($_POST['instruction']) && $_POST['instruction'] != ''){ generate_instruction($_POST['instruction']); }
    else{ generate_instruction('Your name is Oktagon AI'); }

    generate_talk_history();

    generate_talk($_POST['ask']);

    return ask_AI();
}
?>