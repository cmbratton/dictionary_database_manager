// Colby Bratton
// Javascript file to control the submission and button
// operations for Managewords 416

"use strict";

// AJAX request global object
var request = null;
// List to store the ids of all words to
// deleted from word list database
var selected_list = new Array();

function $(id)
{
  return document.getElementById(id);
}

window.onload = function()
{
  // Initialize operations of add word inputs/buttons
  $("word").onkeyup = supply_add_button;
  $("part").onchange = supply_add_button;
  $("part").disabled = true;
  $("definition").onkeyup = supply_add_button;
  $("definition").disabled = true;
  $("add_button").onclick = submit_add_word;
  $("add_button").disabled = true;

  // Initialize operations of delete word inputs/buttons
  $("wordsearch").onkeyup = fetch_words;
  $("delete_button").classList.add("hidden");
  $("delete_button").onclick = submit_delete_list;
}

/**
 * Checks elements checked characteristic and calls to
 * add or remove element from selected_list
 */
function toggle_item()
{
  if (this.checked)
  {
    add_to_selection(this.id);
  }
  else
  {
    remove_from_selection(this.id);
  }
}

/**
 * Adds the index of a word from the word list
 * to selected_list in order to delete the word
 * during the deletion operation
 * @param value the value of the input that was selected
 * @param id the id value of the input that was selected
 */
function add_to_selection(id)
{
  selected_list.push(id);
  refresh_list(id);
}

/**
 * Removes index of a word from the word list
 * so the word will no longer be deleted when
 * submitted
 * @param value the value of the input that was selected
 * @param id the id value of the input that was selected
 */
function remove_from_selection(id)
{
  let index = selected_list.indexOf(id);
  selected_list.splice(index, 1);
  refresh_list(id);
}

/**
 * Creates or refreshes list of currently selected
 * words to be deleted in managewords.php. Also,
 * adds or removes delete button if no words are
 * currently selected
 * @param value the value of the input that was selected
 * @param id the id value of the input that was selected
 */
function refresh_list(id)
{
  if ($("del_" + id) == null)
  {
    let new_li = document.createElement("li");
    new_li.innerHTML = $("span_" + id).innerHTML;
    new_li.id = "del_" + id;
    $("del_list").appendChild(new_li);
  }
  else if ($("del_" + id) != null)
  {
    $("del_" + id).remove();
  }
  if (selected_list.length > 0)
  {
    $("delete_button").classList.remove("hidden");
    $("delete_button").classList.add("visible");
    $("delete_button").focus();
  }
  else
  {
    $("delete_button").classList.add("hidden");
    $("delete_button").classList.remove("visible");
  }
}

/**
 * Checks the validity of all input for adding a
 * word to the list. If all input is acceptable,
 * enables the add button located in managewords.php.
 * Also handles unlocking next input box, for word
 * adding, when an input is provided. For example,
 * when a word as been provided, then the part of
 * speech selection is then enabled.
 */
function supply_add_button()
{
  let add_button = $("add_button");

  let word = $("word");
  let part = $("part");
  let definition = $("definition");

  let word_regex = /^[A-Za-z]+$/g;
  let def_regex = /^(?!\s*$).+/g;
  
  if (word_regex.test(word.value) &&
      def_regex.test(definition.value) &&
      part.value != "")
  {
    add_button.disabled = false;
  }
  else
  {
    add_button.disabled = true;

    // unlock next entry to be tabbed to
    if (word.value != "" &&
        part.disabled == true)
    {
      part.disabled = false;
    }
    else if (part.value != "" &&
             definition.disabled == true)
    {
      definition.disabled = false;
    }
  }
}

/**
 * Utilizes AJAX to retreive all requested words
 * (or words that contain the provided substring)
 * from the word list via get_words.php. Then,
 * generates a checklist of all words for user to
 * utilize in managewords.html
 */
function fetch_words()
{
  if (request)
  {
    request.abort();
    request = null;
  }

  let results_grid = $("search_results_grid");
  let wordsearch = $("wordsearch").value;
  if (wordsearch.length == 0 )
  {
    results_grid.innerHTML = "";
  }
  else
  { 
    request = new XMLHttpRequest();
    let url = "get_words.php?search=" + wordsearch;

    request.open("GET", url, true);
    request.onload = function()
    {
      let word_list = JSON.parse(request.responseText);

      if (results_grid.innerHTML != "")
      {
        results_grid.innerHTML = "";
      }
      
      for (let index = 0; index < word_list.length; index++)
      {
        let word = word_list[index]["word"];
        let part = word_list[index]["part_of_speech"];
        let definition = word_list[index]["definition"];

        add_select_list_element(word, part, definition);
      }

      // revert to null so other requests may be made
      // i.e. add word, delete words
      request = null;
    }
    request.send();
  }
}

/**
 * Supplemental function to generate each new check list
 * element for each word that was returned from get_words.php.
 * @param word word string of new word to be added as an entry
 * @param part part of speech string of new entry
 * @param definition definition string of new entry
 */
function add_select_list_element(word, part, definition)
{
  let results_grid = $("search_results_grid");
  
  let word_input = document.createElement("input");
  word_input.type = "checkbox";
  word_input.id = word + "_" + part;
  word_input.onchange = toggle_item;

  if ($("del_" + word + "_" + part) != null)
  {
    word_input.checked = true;
  }
  
  let word_name = document.createElement("span");
  word_name.id = "span_" + word + "_" + part;
  word_name.innerHTML = word;
  
  
  let part_name = document.createElement("span");
  part_name.classList.add("partofspeech");
  part_name.innerHTML = ": " + part;
  
  let new_list_entry = document.createElement("dt");
  new_list_entry.appendChild(word_input);
  new_list_entry.appendChild(word_name);
  new_list_entry.appendChild(part_name);
  
  let new_list_entry_definition = document.createElement("dd");
  new_list_entry_definition.innerHTML = definition;

  results_grid.appendChild(new_list_entry);
  results_grid.appendChild(new_list_entry_definition);
}

/**
 * Returns add grid back to original state as
 * seen during initial page load. Resets all
 * add grid elements back to an empty or initial
 * state, and disables part input, definition input,
 * and add button.
 */
function reset_add_grid()
{
  $("word").value = "";
  $("part").value = "";
  $("definition").value = "";

  $("part").disabled = true;
  $("definition").disabled = true;
  $("add_button").disabled = true;
}

/**
 * Returns delete grid back to original state as
 * seen during initial page load. Resets all
 * delete grid elements back to an empty state,
 * and reinstantiates selected_list so delete
 * process may take place again.
 */
function reset_delete_grid()
{
  $("del_list").innerHTML = '';
  $("search_results_grid").innerHTML = '';
  $("wordsearch").value = '';
  selected_list = new Array();
  $("delete_button").classList.add("hidden");
  $("delete_button").classList.remove("visible");
}

/**
 * Takes the values of word, part, and definition
 * inputs and sends them to addword.php to have
 * them inserted into the database. 
 * @return returns false to disable page reload on button click
 */
function submit_add_word()
{
  // If a request is currently active, do NOT stop it.
  // Let it finish so there are no errors in the database.
  if (request)
  {
    return false;
  }

  if ($("success_monitor").innerHTML != "")
  {
    $("success_monitor").innerHTML = "";
  }

  let word = $("word").value;
  let part = $("part").value;
  let definition = $("definition").value;

  request = new XMLHttpRequest();
  let url = "addword.php";
  
  request.open("POST", url, true);
  request.setRequestHeader('Content-type',
                           'application/x-www-form-urlencoded');
  request.onload = function()
  {
    let response = request.responseText;
    let success_notice = document.createElement('p');

    // successfully added word
    if (response == 1)
    {
      success_notice.classList.add("success");
      
      success_notice.innerHTML = "Successfully added " + word +
                                 " as " + part + ".";

      // reset entire page since db has been changed
      reset_add_grid();
      reset_delete_grid();
    }
    // word already in database
    else if (response == false)
    {
      success_notice.classList.add("fail");
      
      success_notice.innerHTML = word + " as " + part +
                                 " is already in database.";

      // remove add entry from page so user may type a new one
      reset_add_grid();
    }
    // error adding word entry
    else
    {
      success_notice.classList.add("fail");
      
      success_notice.innerHTML = "Failed to add " + word +
                                 " as " + part + ". Try again?";

      // do not reset, db is unchanged, user may fix their current entry
    }
    $("success_monitor").appendChild(success_notice);
    
    // revert to null so other request may be made
    request = null;
  }
  request.send("word=" + word +
               "&part=" + part +
               "&definition=" + definition);
  
  return false;
}

/**
 * Generates a hidden input element containing the
 * array selected_list as a JSON string to be sent
 * to managewords.php to be deleted. After the input
 * has been created, the HTML form is submitted by
 * this method.
 * @return returns false to disable page reload
 */
function submit_delete_list()
{
  // If a request is currently active, do NOT stop it.
  // Let it finish so there are no errors in the database.
  if (request)
  {
    return false;
  }
  
  if ($("success_monitor").innerHTML != "")
  {
    $("success_monitor").innerHTML = "";
  }
  
  request = new XMLHttpRequest();
  let url = "deletewords.php";
  
  let words_to_delete = JSON.stringify(selected_list);
  
  request.open("POST", url, true);
  request.setRequestHeader('Content-type',
                           'application/x-www-form-urlencoded');
  request.onload = function()
  {
    let success_notice = document.createElement('p');
    // word(s) successfully deleted
    if (request.responseText == 1)
    {
      success_notice.classList.add("success");
      
      success_notice.innerHTML = "Successfully deleted: ";
      
      for (let i = 0; i < selected_list.length; i++)
      {
        let word = selected_list[i].split("_", 1);
        
        if (i == (selected_list.length - 1))
        {
          success_notice.innerHTML += word + ".";
        }
        else
        {
          success_notice.innerHTML += word + ", ";
        }        
      }
    }
    // error deleting word(s)
    else
    {
      success_notice.classList.add("fail");
      
      if (selected_list.length > 1)
      {
        success_notice.innerHTML = "Failed to delete all words";
      }
      else
      {
        success_notice.innerHTML = "Failed to delete word";
      }
    }
    $("success_monitor").appendChild(success_notice);
    
    reset_delete_grid();

    // revert to null so other request may be made
    request = null;
  }
  request.send("words_to_delete=" + words_to_delete);
  
  return false;
}
