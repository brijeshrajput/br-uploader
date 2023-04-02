<?php
// POST Request
include_once('asset.php');
//dd(getBaseUrl());
$request = new stdClass();
foreach ($_POST as $key => $value)
{
    $request->$key = $value;
}
$file = $_FILES['aiz_file'];
if(isset($file))
{
    $request->aiz_file = $file;
}

$type = array(
    "jpg" => "image",
    "jpeg" => "image",
    "png" => "image",
    "svg" => "image",
    "webp" => "image",
    "gif" => "image",
    "mp4" => "video",
    "mpg" => "video",
    "mpeg" => "video",
    "webm" => "video",
    "ogg" => "video",
    "avi" => "video",
    "mov" => "video",
    "flv" => "video",
    "swf" => "video",
    "mkv" => "video",
    "wmv" => "video",
    "wma" => "audio",
    "aac" => "audio",
    "wav" => "audio",
    "mp3" => "audio",
    "zip" => "archive",
    "rar" => "archive",
    "7z" => "archive",
    "doc" => "document",
    "txt" => "document",
    "docx" => "document",
    "pdf" => "document",
    "csv" => "document",
    "xml" => "document",
    "ods" => "document",
    "xlr" => "document",
    "xls" => "document",
    "xlsx" => "document"
);

if (hasFile($request->aiz_file)) {
    $upload = new ArrayObject();
    $extension = strtolower(getClientOriginalExtension($request->aiz_file['name']));

    if (isset($type[$extension])) {
        $upload->file_original_name = null;
        $arr = explode('.', $request->aiz_file['name']);
        for ($i = 0; $i < count($arr) - 1; $i++) {
            if ($i == 0) {
                $upload->file_original_name .= $arr[$i];
            } else {
                $upload->file_original_name .= "." . $arr[$i];
            }
        }

        //$path = $request->file('aiz_file')->store('uploads/all', 'local');
        $path = storeFile($request->aiz_file, $extension, 'uploads/all/');
        //$path = $request->aiz_file['tmp_name'];
        $size = getSize($request->aiz_file['size']);

        
        // if ($type[$extension] == 'image' && get_setting('disable_image_optimization') != 1) {
        //     try {
        //         $img = Image::make($request->file('aiz_file')->getRealPath())->encode();
        //         $height = $img->height();
        //         $width = $img->width();
        //         if ($width > $height && $width > 1500) {
        //             $img->resize(1500, null, function ($constraint) {
        //                 $constraint->aspectRatio();
        //             });
        //         } elseif ($height > 1500) {
        //             $img->resize(null, 800, function ($constraint) {
        //                 $constraint->aspectRatio();
        //             });
        //         }
        //         $img->save(base_path('public/') . $path);
        //         clearstatcache();
        //         $size = $img->filesize();
        //     } catch (\Exception $e) {
        //         //dd($e);
        //     }
        // }

        $upload->extension = $extension;
        $upload->file_name = $path;
        $upload->user_id = 0;
        $upload->type = $type[$upload->extension];
        $upload->file_size = $size;
        
        saveInDb($upload);
        //dd($upload);
    }
    header('Content-Type: application/json; charset=utf-8');
    echo '{}';
}

?>