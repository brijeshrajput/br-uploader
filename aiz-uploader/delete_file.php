<?php
// GET Request

include_once('asset.php');

$id = '';
if(isset($_GET['id'])) {
    $id = $_GET['id'];
}

$q = "DELETE FROM uploads WHERE id = $id";

if (mysqli_query($sqlConnect, $q)) {
    header('Location: ' . $_SERVER['HTTP_REFERER']);
} else {
    echo "Error deleting record: " . mysqli_error($sqlConnect);
}


?>