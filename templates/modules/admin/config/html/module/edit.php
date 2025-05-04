<div id="EditModuleBox" style="display: none;">
    <div class="box col100">
        <form method="post" class="boxInner editModuleForm">
            <input type="hidden" name="module">
            <label for="edit_name" data-slovar="Module_title"></label>
            <input type="text" name="name" id="edit_name" placeholder="My Module" required>

            <label for="edit_icon" data-slovar="Icon"></label>
            <select name="icon" id="edit_icon">
                <option></option>
                <option>x</option>
                <option>delete</option>
                <option>more</option>
                <option>link</option>
                <option>list</option>
                <option>plus-circle</option>
                <option>show-more</option>
                <option>download</option>
                <option>check</option>
                <option>clock</option>
                <option>settings</option>
                <option>move</option>
                <option>dashboard</option>
                <option>user</option>
                <option>chat</option>
                <option>email</option>
                <option>phone</option>
                <option>filter</option>
                <option>upload</option>
                <option>calendar</option>
                <option>attachment</option>
                <option>truck</option>
                <option>target</option>
                <option>refresh</option>
                <option>package</option>
            </select>

            <label data-slovar="Category"></label>
            <div class="getModuleCategories"></div>

            <hr>
            <label data-slovar="Accessories"></label>
            <input type="text" name="accessories">
            <div style="display:flex;flex-wrap::wrap;gap:10px;padding:10px;">
                <div>calendar</div>
                <div>pipeline</div>
                <div>analytic</div>
            </div>

            <br>
            <button class="button buttonBlue buttonSubmit" data-slovar="Edit"></button>
            <span class="button buttonBlack" onClick="closeEditModule()" data-slovar="Cancel"></span>
        </form>
    </div>
</div>

<form method="post" class="toggleModuleForm" style="display: none;">
    <input type="hidden" name="module">
    <input type="hidden" name="active">
</form>

<div id="EditColumnBox" style="display: none;">
    <div class="box col100">
        <form method="post" class="boxInner editColumnForm">
            <input type="hidden" name="column_id">
            <div id="EditColumnExtra"></div>
            <label data-slovar="Group"></label>
            <div class="getColumnCategories"></div>
            <br>
            <button class="button buttonBlue buttonSubmit" data-slovar="Edit"></button>
            <span class="button buttonBlack" onClick="closeEditColumn()" data-slovar="Cancel"></span>
        </form>
    </div>
</div>

<form method="post" class="sortColumnsForm" style="display: none;">
    <input type="hidden" name="column_id">
</form>