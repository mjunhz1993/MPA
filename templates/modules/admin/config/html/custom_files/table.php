<div class="box col80">

	<table class="tableTop">
		<tr>
			<td><button class="button buttonGreen" onclick="openCreateCustomFile()" data-slovar="Add_new"></button></td>
			<td>
				<select id="FileTableExtFilter" class="tableTopSelect">
					<option value="">All File Types</option>
					<option value="php">PHP</option>
					<option value="js">Javascript</option>
					<option value="css">CSS</option>
					<option value="sql">SQL</option>
				</select>
				<input type="text" id="FileTableProjectFilter" placeholder="Search by name">
				<input type="text" id="FileContentProjectFilter" placeholder="Search by content">
			</td>
		</tr>
	</table>

	<?php
	$dir = $_SERVER['DOCUMENT_ROOT']. '/crm/php/downloads';
	if(!is_dir($dir)){ mkdir($dir); }
	?>

	<div class="boxInner">
		<table class="table" id="FileTable" style="table-layout:fixed">
			<thead>
				<tr>
					<th style="width:90px"></th>
					<th data-slovar="Name"></th>
					<th data-slovar="Project"></th>
					<th>Last update</th>
					<th data-slovar="Tools"></th>
				</tr>
				<tr>
					<td colspan="2"></td>
					<td>
						<select id="selectProjectName" onchange="filterProjectName($(this))"></select>
					</td>
					<td colspan="2"></td>
				</tr>
			</thead>
			<tbody></tbody>
		</table>
	</div>

</div>