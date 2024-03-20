chrome.storage.sync.get(["lecturerSelect"], function (items) {
  var selectElement = document.getElementById("lecturerSelect");
  if (items.lecturerSelect !== undefined) {
    selectElement.value = items.lecturerSelect;
  } else {
    selectElement.value = "1";
  }
});

chrome.storage.sync.get(["skipCheckbox"], function (items) {
  let checkboxElement = document.querySelector(".skipCheckbox");
  if (items.skipCheckbox !== undefined) {
    checkboxElement.checked = items.skipCheckbox;
  } else {
    checkboxElement.checked = true;
  }
});

chrome.storage.sync.get(["scrollCheckbox"], function (items) {
  let checkboxElement = document.querySelector(".scrollCheckbox");
  if (items.scrollCheckbox !== undefined) {
    checkboxElement.checked = items.scrollCheckbox;
  } else {
    checkboxElement.checked = true;
  }
});

const selectAll = (num, checkboxValue, cbScrollValue) => {
  if (cbScrollValue === true) {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  if (checkboxValue === true) {
    var textAreas = document.querySelectorAll("textarea");
    textAreas.forEach(function (textArea) {
      textArea.innerHTML += " ";
    });
  }

  let radioButtons = document.querySelectorAll('input[type="radio"]');
  let groupCounts = {};

  for (let i = 0; i < radioButtons.length; i++) {
    let radioButton = radioButtons[i];
    if (radioButton.name && radioButton.name !== "") {
      if (
        groupCounts[radioButton.name] !== undefined &&
        groupCounts[radioButton.name] !== null
      ) {
        groupCounts[radioButton.name] = groupCounts[radioButton.name] + 1;
      } else {
        groupCounts[radioButton.name] = 1;
      }
      if (groupCounts[radioButton.name] === num) {
        radioButton.checked = true;
      }
    }
  }
};

async function getCurrentTab() {
  try {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
  } catch (error) {
    console.error("Error occurred while getting current tab:", error);
    return null;
  }
}

const confirm = () => {
  let selectElement = document.getElementById("lecturerSelect");
  let selectedValue = parseInt(selectElement.value);

  let checkboxElement = document.querySelector(".skipCheckbox");
  let checkboxSkip = checkboxElement.checked;

  let cbScrollElement = document.querySelector(".scrollCheckbox");
  let checkboxScroll = cbScrollElement.checked;

  chrome.storage.sync.set({ lecturerSelect: selectedValue });
  chrome.storage.sync.set({ skipCheckbox: checkboxSkip });
  chrome.storage.sync.set({ scrollCheckbox: checkboxScroll });
  // console.log(checkboxValue);
  getCurrentTab().then((tab) => {
    if (tab == null || !tab.url.includes("https://mydtu.duytan.edu.vn/"))
      return;
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: selectAll,
      args: [selectedValue, checkboxSkip, checkboxScroll],
    });
  });
};

document.getElementById("comfirmButton").addEventListener("click", confirm);
