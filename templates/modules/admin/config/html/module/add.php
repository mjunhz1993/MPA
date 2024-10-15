<div id="AddModuleBox" style="display: none;">
    <div class="box col100">
        <form method="post" class="boxInner addModuleForm">
            <label for="add_modul" data-slovar="Module_name"></label>
            <input type="text" name="module" id="add_modul" placeholder="mymodule" onkeyup="SQLTableNameFriendly($(this))" required>
            <label for="add_name" data-slovar="Module_title"></label>
            <input type="text" name="name" id="add_name" placeholder="My Module" required>

            <label data-slovar="Category"></label>
            <div class="getModuleCategories"></div>

            <br>
            <hr>

            <label data-slovar="Custom_module"></label>
            <select name="custom_file"><option value=""></option></select>

            <hr>
            <button class="button buttonBlue buttonSubmit" data-slovar="Add_new"></button>
            <span class="button buttonBlack" onClick="closeAddModule()" data-slovar="Cancel"></span>
        </form>
    </div>
</div>


<div id="AddColumnBox" style="display: none;">
    <div class="box col100">
        <form method="post" class="boxInner addColumnForm">
            <input type="hidden" name="module">
            <label for="add_column">Ime stolpca</label>
            <input type="text" name="column_id" id="add_column" placeholder="mycolumn" onkeyup="SQLTableNameFriendly($(this))" required>
            <label for="add_cname">Naslov stolpca</label>
            <input type="text" name="name" id="add_cname" placeholder="My column" required>

            <label>Skupina</label>
            <div class="getColumnCategories"></div>

            <br><br>
            <label for="add_type">Tip</label>
            <select name="type" id="add_type">
                <optgroup label="Osnovni tipi">
                    <option value="VARCHAR">Besedilo (VARCHAR)</option>
                    <option value="INT">Številka (INT)</option>
                    <option value="DECIMAL">Decimalka (DECIMAL)</option>
                </optgroup>
                <optgroup label="Izbira datuma ali časa (Datepicker)">
                    <option value="DATE">Datum (Local)</option>
                    <option value="TIME">čas (Local)</option>
                    <option value="DATETIME">Datum + čas (UTC)</option>
                </optgroup>
                <optgroup label="Specijalni tipi">
                    <option value="PRICE">Cena</option>
                    <option value="PERCENT">Procent</option>
                    <option value="TEXTAREA">Urejevalec besedila (Cleditor)</option>
                    <option value="CHECKBOX">Potrditveno polje (CHECKBOX)</option>
                    <option value="SELECT">Izbirni meni (SELECT MENU)</option>
                    <option value="FILE">Polje za nalaganje datotek (FILE)</option>
                    <option value="BUTTON">Tipka s JS funkcijo</option>
                </optgroup>
                <optgroup label="Povezovalni tipi">
                    <option value="JOIN_ADD">Ustvari povezavo s tabelo (FOREIGN KEY)</option>
                    <option value="JOIN_ADD_SELECT">Prikaži stolpec iz povezane tabele (LEFT JOIN SELECT)</option>
                    <option value="JOIN_GET">Prikaži vse vrstice ki so vezane na to vrstico</option>
                </optgroup>
            </select>

            <div id="AddColumnExtra"></div>

            <br>
            <hr>
            <button class="button buttonBlue buttonSubmit" data-slovar="Add_new"></button>
            <span class="button buttonBlack" onClick="closeAddColumn()" data-slovar="Cancel"></span>
        </form>
    </div>
</div>