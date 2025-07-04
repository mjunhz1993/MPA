<div class="box col80" id="modul_table">
    <div class="boxInner">
        <button class="button buttonGreen" onclick="openAddModule()" data-slovar="Add_new"></button>
        <button class="button buttonGrey" onclick="openImportModule()" data-slovar="Import"></button>
    </div>
    <div class="horizontalTable">
        <table class="table">
            <thead>
                <tr>
                    <th class="no-sort"></th>
                    <th class="no-sort" data-slovar="Active"></th>
                    <th class="no-sort" data-slovar="Icon"></th>
                    <th data-slovar="Name"></th>
                    <th data-slovar="Category"></th>
                    <th class="no-sort"></th>
                </tr>
            </thead>
            <tbody>
            <?php
            $st = 0;
            $A = $SQL->query("SELECT module, custom, active, icon, name, category, archive, accessories, url 
            FROM module ORDER BY order_num");
            while ($B = $A->fetch_assoc()): $st++;
            ?>
                <tr 
                data-module="<?= $B['module']; ?>" 
                data-name="<?= $B['name']; ?>"
                data-category="<?= $B['category']; ?>"
                data-archive="<?= $B['archive']; ?>" 
                data-accessories="<?= $B['accessories']; ?>"
                data-url="<?= $B['url']; ?>"
                >
                    <td data-svg="move" style="cursor:move"></td>
                    <td class="no-drag">
                        <input 
                        type="checkbox" 
                        id="moduleAct<?= $st; ?>" 
                        onchange="toggleModule($(this))" 
                        <?php if($B['active'] == 1): ?> checked <?php endif; ?> />
                        <label for="moduleAct<?= $st; ?>" class="chekboxLabel" data-slovar="Active"></label>
                    </td>
                    <td class="no-drag Micon" data-svg="<?= $B['icon']; ?>"></td>
                    <td class="no-drag" data-slovar="<?= $B['name']; ?>"></td>
                    <td class="no-drag" data-slovar="<?= $B['category']; ?>"></td>
                    <td class="no-drag">
                        <div class="linksvg more" data-svg="settings" onClick="showDropdownMenu($(this))">
                            <div class="DropdownMenuContent">
                                <a onclick="openEditModule('<?= $B['module']; ?>')" data-slovar="Edit_module"></a>
                                <a onclick="loadJS('dev/addons', function(){openEditAddons('<?= $B['module']; ?>')})" data-slovar="Edit_addons"></a>
                                <?php if($B['url'] == ''): ?>
                                <a onclick="loadJS('dev/presets', function(){openPreset('<?= $B['module']; ?>')})" data-slovar="Edit_presets"></a>
                                <a onclick="loadJS('dev/automations', function(){openEditAutomations('<?= $B['module']; ?>')})" data-slovar="Edit_automations"></a>
                                <a onclick="openColumns('<?= $B['module']; ?>')" data-slovar="Edit_columns"></a>
                                <?php endif; ?>
                                <?php if($B['custom'] == 1): ?>
                                <hr>
                                <a onclick="deleteModule('<?= $B['module']; ?>')" data-slovar="Delete"></a>
                                <?php endif; ?>
                            </div>
                        </div>
                    </td>
                </tr>
            <?php endwhile; ?>
            </tbody>
        </table>
    </div>
</div>


<div class="box col80" id="column_table" style="display: none;">
    <table class="tableTop">
        <tr>
            <td>
                <button class="button buttonBlack" onclick="closeColumns()" data-slovar="Go_back"></button>
            </td>
            <td><button class="button buttonGreen" data-slovar="Add_new"></button></td>
        </tr>
    </table>
    <div class="horizontalTable">
        <table class="table">
            <thead>
                <tr>
                    <th class="no-sort"></th>
                    <th class="no-sort" data-slovar="Name"></th>
                    <th class="no-sort" data-slovar="Type"></th>
                    <th class="no-sort" data-slovar="Group"></th>
                    <th class="no-sort" data-slovar="Data"></th>
                    <th class="no-sort"></th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    </div>
</div>