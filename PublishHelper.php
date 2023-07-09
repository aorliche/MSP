<?php
    $data = json_decode(file_get_contents('php://input'), true);

	//$mysqli = new mysqli('localhost', 'calmprep_anton', 'MySQL1@bbb', 'calmprep_hunimal');
	$mysqli = new mysqli('localhost', 'anton', 'AtlanticCityPass', 'hunimal');

    if ($mysqli->connect_errno) {
        printf("Connect failed: %s\n", $mysqli->connect_error);
        exit();
    }

    $stmt = $mysqli->prepare("insert into publish (name, json) values (?, ?)");
    $stmt->bind_param("ss", $data['name'], $data['recording']);
    $success = $stmt->execute();

    if ($success) {
        printf("Success\n");
    } else {
        printf("Error: %s\n", $stmt->error);
    }
?>
