<?php
/**
 * a program to supply a list of words in JSON list
 * based on a search criterion.
 * @author Colby Bratton
 * @version 11 Apr 2021
 */

error_reporting(E_ALL);
ini_set('display_errors', '1');

require('../../cs315/dblogin.php');

$db = new PDO(
  "mysql:host=$db_hostname;dbname=cmb7742;charset=utf8",
  $db_username, $db_password,
  array(PDO::ATTR_EMULATE_PREPARES => false,
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION));

$sql = 'select word, part_of_speech, definition
                from entry
                where word like :search
                order by word';

if (isset($_GET) && 
    isset($_GET['search']) && preg_match('/^[a-z]+$/', $_GET['search']))
{
  $search = $_GET['search'] . "%";
  
  $statement = $db->prepare($sql);
  $statement->bindValue(':search', $search);
  $statement->execute();
  $results = $statement->fetchAll(PDO::FETCH_ASSOC);

  $final_list = json_encode($results);
  echo $final_list;
}
?>
