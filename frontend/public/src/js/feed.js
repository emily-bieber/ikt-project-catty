let shareImageButton = document.querySelector("#share-image-button");
let createPostArea = document.querySelector("#create-post");
let closeCreatePostModalButton = document.querySelector(
  "#close-create-post-modal-btn"
);
let sharedMomentsArea = document.querySelector("#shared-moments");
let loadingSpinner = document.getElementById("loading-spinner");
let form = document.querySelector("form");
let titleInput = document.querySelector("#title");
let textInput = document.querySelector("#text");
let videoPlayer = document.querySelector("#player");
let canvasElement = document.querySelector("#canvas");
let captureButton = document.querySelector("#capture-btn");
let imagePicker = document.querySelector("#image-picker");
let imagePickerArea = document.querySelector("#pick-image");
let file = null;
let titleValue = "";
let textValue = "";
let imageURI = "";
let dateValue = new Date().toLocaleDateString();

function initializeMedia() {
  if (!("mediaDevices" in navigator)) {
    navigator.mediaDevices = {};
  }

  if (!("getUserMedia" in navigator.mediaDevices)) {
    navigator.mediaDevices.getUserMedia = function (constraints) {
      let getUserMedia =
        navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

      if (!getUserMedia) {
        return Promise.reject(new Error("getUserMedia is not implemented"));
      }

      return new Promise((resolve, reject) => {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    };
  }

  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      videoPlayer.srcObject = stream;
      videoPlayer.style.display = "block";
    })
    .catch((err) => {
      imagePickerArea.style.display = "block";
    });
}

function openCreatePostModal() {
  setTimeout(() => {
    createPostArea.style.transform = "translateY(0)";
  }, 1);
  initializeMedia();
}

function closeCreatePostModal() {
  imagePickerArea.style.display = "none";
  videoPlayer.style.display = "none";
  canvasElement.style.display = "none";
  if (videoPlayer.srcObject) {
    videoPlayer.srcObject.getVideoTracks().forEach((track) => track.stop());
  }
  setTimeout(() => {
    createPostArea.style.transform = "translateY(100vH)";
  }, 1);
}


shareImageButton.addEventListener("click", openCreatePostModal);

closeCreatePostModalButton.addEventListener("click", closeCreatePostModal);

function createCard(card) {
  let cardWrapper = document.createElement("div");
  cardWrapper.className = "card shadow p-3";
  let cardBody = document.createElement("div");
  cardBody.className = "card-body p-0 pt-4";
  let cardTitle = document.createElement("h5");
  cardTitle.className = "card-text__title";
  let cardText = document.createElement("p");
  cardText.className = "card-text";
  let image = new Image();
  image.src = card.image_id;
  image.className = "card-img-top";
  let cardDate = document.createElement("div");
  cardDate.className = "date"; 
  let cardDateText = document.createElement("p");
  cardDateText.className = "m-0";
  
  cardDateText.textContent = card.date;
  cardTitle.textContent = card.title;
  cardText.textContent = card.text;

  cardWrapper.appendChild(image);
  cardWrapper.appendChild(cardBody);
  cardWrapper.appendChild(cardDate);
  cardBody.appendChild(cardTitle);
  cardBody.appendChild(cardText);
  cardDate.appendChild(cardDateText);
  sharedMomentsArea.appendChild(cardWrapper);
}

loadingSpinner.style.display = "block";

fetch("http://localhost:3000/posts")
  .then((res) => {
    return res.json();
  })
  .then((data) => {
    console.log("From backend ...", data);
    loadingSpinner.style.display = "none";
    updateUI(data);
  })
  .catch((err) => {
    if ("indexedDB" in window) {
      readAllData("posts").then((data) => {
        console.log("From cache ...", data);
        loadingSpinner.style.display = "none";
        updateUI(data);
      });
    }
  });

function updateUI(data) {
  for (let card of data) {
    createCard(card);
  }
}

function sendDataToBackend() {
  const formData = new FormData();
  formData.append("title", titleValue);
  formData.append("text", textValue);
  formData.append("date", dateValue);
  formData.append("file", file);

  console.log("formData", formData);

  fetch("http://localhost:3000/posts", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      console.log("Data sent to backend ...", response);
      return response.json();
    })
    .then((data) => {
      console.log("data ...", data);
      const newPost = {
        title: data.title,
        text: data.text,
        date: data.date,
        image_id: imageURI,
      };
      updateUI([newPost]);
    });
}

form.addEventListener("submit", (event) => {
  event.preventDefault(); // nicht absenden und neu laden

  if (file == null) {
    alert("Please take a photo or choose one from your files.");
    return;
  }
  if (titleInput.value.trim() === "") {
    alert("Please give your post at least a title.");
    return;
  }

  closeCreatePostModal();

  titleValue = titleInput.value;
  textValue = textInput.value;
  console.log("titleInput", titleValue);
  console.log("textInput", textValue);
  console.log("date", dateValue);
  console.log("file", file);

  if ("serviceWorker" in navigator && "SyncManager" in window) {
    navigator.serviceWorker.ready.then((sw) => {
      let post = {
        id: new Date().toISOString(),
        title: titleValue,
        text: textValue,
        date: dateValue,
        image_id: file,
      };

      writeData("sync-posts", post)
        .then(() => {
          return sw.sync.register("sync-new-post");
        })
        .then(() => {
          let snackbar = document.getElementById('confirmation-toast');
          let confirmationSnackbar = bootstrap.Toast.getOrCreateInstance(snackbar);
          confirmationSnackbar.show();
        });
    });
  } else {
    sendDataToBackend();
  }
});

captureButton.addEventListener("click", (event) => {
  event.preventDefault(); // nicht absenden und neu laden
  canvasElement.style.display = "block";
  videoPlayer.style.display = "none";
  captureButton.style.display = "none";
  let context = canvasElement.getContext("2d");
  context.drawImage(
    videoPlayer,
    0,
    0,
    canvas.width,
    videoPlayer.videoHeight / (videoPlayer.videoWidth / canvas.width)
  );
  videoPlayer.srcObject.getVideoTracks().forEach((track) => {
    track.stop();
  });
  imageURI = canvas.toDataURL("image/jpg");
  // console.log('imageURI', imageURI)       // base64-String des Bildes

  fetch(imageURI)
    .then((res) => {
      return res.blob();
    })
    .then((blob) => {
      file = new File([blob], "myFile.jpg", { type: "image/jpg" });
      console.log("file", file);
    });
});

imagePicker.addEventListener("change", (event) => {
  file = event.target.files[0];
});
