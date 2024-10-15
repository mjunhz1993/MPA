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
            $A = $SQL->query("SELECT module, custom, active, icon, name, category, archive, notification_config, accessories, url 
            FROM module ORDER BY order_num");
            while ($B = $A->fetch_row()): $st++;
            ?>
                <tr 
                data-module="<?php echo $B[0]; ?>" 
                data-name="<?php echo $B[4]; ?>"
                data-category="<?php echo $B[5]; ?>"
                data-archive="<?php echo $B[6]; ?>" 
                data-notification="<?php echo $B[7]; ?>" 
                data-accessories="<?php echo $B[8]; ?>"
                data-url="<?php echo $B[9]; ?>"
                >
                    <td data-svg="move" style="cursor:move"></td>
                    <td class="no-drag">
                        <input type="checkbox" id="moduleAct<?php echo $st; ?>" onchange="toggleModule($(this))" <?php if($B[2] == 1): ?> checked <?php endif; ?> />
                        <label for="moduleAct<?php echo $st; ?>" class="chekboxLabel" data-slovar="Active"></label>
                    </td>
                    <td class="no-drag Micon" data-svg="<?php echo $B[3]; ?>"></td>
                    <td class="no-drag" data-slovar="<?php echo $B[4]; ?>"></td>
                    <td class="no-drag" data-slovar="<?php echo $B[5]; ?>"></td>
                    <td class="no-drag">
                        <div class="linksvg more" data-svg="settings" onClick="showDropdownMenu($(this))">
                            <div class="DropdownMenuContent">
                                <a onclick="openEditModule('<?php echo $B[0]; ?>')" data-slovar="Edit_module"></a>
                                <?php if($B[9] == ''): ?>
                                <a onclick="openEditNotifications('<?php echo $B[0]; ?>')" data-slovar="Edit_notifications"></a>
                                <?php endif; ?>
                                <?php if($B[9] == ''): ?>
                                <a onclick="loadJS('dev/calendar', function(){openEditCalendar('<?php echo $B[0]; ?>')})" data-slovar="Edit_calendar"></a>
                                <?php endif; ?>
                                <?php if($B[9] == ''): ?>
                                <a onclick="loadJS('dev/automations', function(){openEditAutomations('<?php echo $B[0]; ?>')})" data-slovar="Edit_automations"></a>
                                <?php endif; ?>
                                <a onclick="loadJS('dev/addons', function(){openEditAddons('<?php echo $B[0]; ?>')})" data-slovar="Edit_addons"></a>
                                <?php if($B[9] == ''): ?>
                                <a onclick="openColumns('<?php echo $B[0]; ?>')" data-slovar="Edit_columns"></a>
                                <?php endif; ?>
                                <?php if($B[1] == 1): ?>
                                <hr>
                                <a onclick="deleteModule('<?php echo $B[0]; ?>')" data-slovar="Delete"></a>
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
                    <th class="no-sort"></th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    </div>
</div>