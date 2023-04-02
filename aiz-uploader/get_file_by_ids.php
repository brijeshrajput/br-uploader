<?php
// POST Request
include_once('asset.php');
include_once('helper.php');

$request = $_POST['ids'];

$ids = explode(',', $request);

$q = "SELECT * FROM uploads WHERE id IN (".$request.")";

$files = mysqli_query($sqlConnect, $q);
$new_file_array = [];
// $new_file_array = new Base();

if (mysqli_num_rows($files) > 0) {
    // output data of each row
    while ($file = mysqli_fetch_assoc($files)) {
        $data = new Data();
        $data->id = (int)$file['id'];
        $data->file_original_name = $file['file_original_name'];
        $data->file_name = my_asset($file['file_name']);;
        $data->user_id = $file['user_id'];
        $data->file_size = $file['file_size'];
        $data->extension = $file['extension'];
        $data->type = $file['type'];
        if ($file['external_link'] != null) {
            $data->external_link = $file['external_link'];
        }
        $data->created_at = $file['created_at'];
        $data->updated_at = $file['updated_at'];
        $data->deleted_at = $file['deleted_at'];
        $new_file_array[] = $data;
        // $new_file_array->data[] = $data;

        // $file['file_name'] = my_asset($file['file_name']);
        // if ($file['external_link']) {
        //     $file['file_name'] = $file['external_link'];
        // }
        // $new_file_array[] = $file;
    }
}

//dd($new_file_array);
header('Content-Type: application/json; charset=utf-8');
echo json_encode($new_file_array);
// return $files;


?>