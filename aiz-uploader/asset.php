<?php

// include_once('output.php');

$sql_db_host = "localhost";
// MySQL Database User
$sql_db_user = "root";
// MySQL Database Password
$sql_db_pass = "";
// MySQL Database Name
$sql_db_name = "exp";

// Connect to SQL Server
$sqlConnect   =  mysqli_connect($sql_db_host, $sql_db_user, $sql_db_pass, $sql_db_name, 3306);
// Handling Server Errors
$ServerErrors = array();
if (mysqli_connect_errno()) {
    $ServerErrors[] = "Failed to connect to MySQL: " . mysqli_connect_error();
}

function dd($data)
{
    echo '<pre>';
    var_dump($data);
    echo '</pre>';
    die();
}

/**
 * Collapse an array of arrays into a single array.
 *
 * @param  iterable  $array
 * @return array
 */
function collapse($array)
{
    $results = [];
    foreach ($array as $values) {
        if ($values instanceof Collection) {
            $values = $values->all();
        } elseif (! is_array($values)) {
            continue;
        }
        $results[] = $values;
    }
    return array_merge([], ...$results);
}

/**
 * Determine whether the given value is array accessible.
 *
 * @param  mixed  $value
 * @return bool
 */
function accessible($value)
{
    return is_array($value) || $value instanceof ArrayAccess;
}

/**
 * Determine if the given key exists in the provided array.
 *
 * @param  \ArrayAccess|array  $array
 * @param  string|int  $key
 * @return bool
 */
function exists($array, $key)
{
    if ($array instanceof Enumerable) {
        return $array->has($key);
    }
    if ($array instanceof ArrayAccess) {
        return $array->offsetExists($key);
    }
    return array_key_exists($key, $array);
}

if (! function_exists('value')) {
    /**
     * Return the default value of the given value.
     *
     * @param  mixed  $value
     * @return mixed
     */
    function value($value, ...$args)
    {
        return $value instanceof Closure ? $value(...$args) : $value;
    }
}

if(! function_exists('getSize()')){
    /**
     * Get the size of the file.
     *
     * @param  string  $file
     * @return int
     */
    function getSize($file_size)
    {
        return (int)round($file_size);
    }
}

if (! function_exists('data_get')) {
    /**
     * Get an item from an array or object using "dot" notation.
     *
     * @param  mixed  $target
     * @param  string|array|int|null  $key
     * @param  mixed  $default
     * @return mixed
     */
    function data_get($target, $key, $default = null)
    {
        if (is_null($key)) {
            return $target;
        }

        $key = is_array($key) ? $key : explode('.', $key);

        foreach ($key as $i => $segment) {
            unset($key[$i]);

            if (is_null($segment)) {
                return $target;
            }

            if ($segment === '*') {
                if ($target instanceof Collection) {
                    $target = $target->all();
                } elseif (! is_array($target)) {
                    return value($default);
                }

                $result = [];

                foreach ($target as $item) {
                    $result[] = data_get($item, $key);
                }

                return in_array('*', $key) ? collapse($result) : $result;
            }

            if (accessible($target) && exists($target, $segment)) {
                $target = $target[$segment];
            } elseif (is_object($target) && isset($target->{$segment})) {
                $target = $target->{$segment};
            } else {
                return value($default);
            }
        }

        return $target;
    }
}

    /**
     * Retrieve a file from the request.
     *
     * @param  string|null  $key
     * @param  mixed  $default
     * @return UploadedFile[]|array|null
     */
    function mfile($target ,$key = null, $default = null)
    {
        return data_get($target, $key, $default);
    }


/**
 * Returns the original file extension.
 *
 * It is extracted from the original file name that was uploaded.
 * Then it should not be considered as a safe value.
 *
 * @return string
 */
function getClientOriginalExtension($name)
{
    return pathinfo($name, PATHINFO_EXTENSION);
}

/**
 * Check that the given file is a valid file instance.
 *
 * @param  mixed  $file
 * @return bool
 */
function isValidFile($file)
{
    return true;
}

/**
 * Determine if the uploaded data contains a file.
 *
 * @param  string  $key
 * @return bool
 */
function hasFile($key)
{
    if (! is_array($files = mfile($key))) {
        $files = [$files];
    }
    foreach ($files as $file) {
        if (isValidFile($file)) {
            return true;
        }
    }
    return false;
}

if(! function_exists('storeFile')){
    /**
     * Get the mime type of the file.
     *
     * @param  string  $file,$extension, $path
     * @return string|boolean
     */
    function storeFile($file, $extension, $path){
        $final_path = false;

        $name = rand(100,999).'.'.$extension;
        try{
            $uploaded = move_uploaded_file($file['tmp_name'], $path.$name);
            if($uploaded){
                $final_path = $path.$name;
            }
        }catch(Exception $e){
            $final_path = false;
            dd($e);
        }
        return $final_path;
    }
}

if(! function_exists('getBaseUrl')){
    function getBaseUrl()
    {
        // output: /myproject/index.php
        $currentPath = $_SERVER['PHP_SELF']; 

        // output: Array ( [dirname] => /myproject [basename] => index.php [extension] => php [filename] => index ) 
        $pathInfo = pathinfo($currentPath); 

        // output: localhost
        $hostName = $_SERVER['HTTP_HOST']; 

        // output: http://
        $protocol = strtolower(substr($_SERVER["SERVER_PROTOCOL"],0,5))=='https://'?'https://':'http://';

        // return: http://localhost/myproject/
        return $protocol.$hostName.$pathInfo['dirname']."/";
    }
}

function saveInDb($data){
    global $sqlConnect;
    $q = "INSERT INTO `uploads` (`id`, `file_original_name`, `file_name`, `user_id`, `file_size`, `extension`, `type`, `external_link`) VALUES (NULL, '". $data->file_original_name ."', '".$data->file_name."', '".$data->user_id."', '".$data->file_size."', '".$data->extension."', '".$data->type."', NULL)";

    mysqli_query($sqlConnect, $q);
}

function my_asset($path, $secure = null)
    {
        return 'http://localhost/exp/aiz-uploader/' . $path;
    }


?>