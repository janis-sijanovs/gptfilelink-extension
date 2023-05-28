document.addEventListener('DOMContentLoaded', function() {
    var toggleSwitch = document.getElementById('toggleSwitch');
  
    // Retrieve the stored toggle state from storage
    chrome.storage.sync.get('extensionEnabled', function(data) {
      toggleSwitch.checked = data.extensionEnabled || false;
    });
  
    // Update the toggle state in storage when the switch is changed
    toggleSwitch.addEventListener('change', function(event) {
      var isChecked = event.target.checked;
      chrome.storage.sync.set({ 'extensionEnabled': isChecked });
    });
  });
  