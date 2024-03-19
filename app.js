// Get the modal
var modal = document.getElementById("myModal");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// Get the form
var form = document.querySelector("form");

// When the user clicks on <span> (x), close the modal and reset the form
span.onclick = function() {
  modal.style.display = "none";
  form.reset(); // Reset the form
}

// When the user clicks anywhere outside of the modal, close it and reset the form
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
    form.reset(); // Reset the form
  }
}

// Additional JavaScript for form submission
form.addEventListener("submit", function(event) {
  event.preventDefault(); // Prevent form submission
  modal.style.display = "block"; // Show the modal
});
