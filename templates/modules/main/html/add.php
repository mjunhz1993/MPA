<div id="AddBox">
    <div id="AddBoxInner" class="box col100">
        <form method="post" class="boxInner" data-url="add_row">
            <div id="addFormInner"></div>
            <br>
            <button class="button buttonGreen buttonSubmit" onclick="submitAddBox()" data-slovar="Add_new"></button>
            <span class="button buttonBlack" onClick="closeAddBox()" data-slovar="Cancel"></span>
        </form>
    </div>
</div>

<script>
    var data = {left: {title: slovar('Add_new')}}
    $('#AddBoxInner').prepend(HTML_tableTop(data));
</script>