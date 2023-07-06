const dropZone = document.querySelector(".drop-zone");
const browseBtn = document.querySelector(".browseBtn");
const fileInput= document.querySelector("#fileInput");

const progressContainer = document.querySelector(".progress-conatiner")
const bgProgress = document.querySelector(".bg-progress");
const progressBar = document.querySelector(".progress-bar");
const percentDiv = document.querySelector("#percent");


const sharingContainer = document.querySelector(".sharing-container");
const fileURLInput = document.querySelector("#fileURL");
const copyBtn = document.querySelector("#copyBtn");


const emailForm = document.querySelector("#emailForm")

const toast = document.querySelector(".toast")

const host = "https://innshare.herokuapp.com/";
const uploadURL = `${host}api/files`;
const emailURL = `${host}api/files/send`;

const maxAllowedSize = 100 * 1024 * 1024;// 100mb

dropZone.addEventListener("dragover",(e)=>{
    e.preventDefault()
    if(!dropZone.classList.contains("dragged")){
        dropZone.classList.add("dragged");
    }
    
})

dropZone.addEventListener("dragleave",()=>{
   dropZone.classList.remove("dragged")
})

dropZone.addEventListener("drop",(e)=>{
    e.preventDefault()
    dropZone.classList.remove("dragged")
    const files=e.dataTransfer.files 
    console.log(files);
    if(files.length){
    fileInput.files = files; 
    uploadFile()
    } 
})

fileInput.addEventListener("chnage",()=>{
    uploadFile()
})

 browseBtn.addEventListener("click",()=>{
    fileInput.click();
 })

copyBtn.addEventListener("click", ()=>{
    fileURLInput.select()
    document.execCommand("copy");
    showToast("Link Copied")
})

 const uploadFile = ()=>{
     if(fileInput.files.length > 1){
        resetFileInput();
        showToast("Only Upload 1 Fiile!")
       return
     }
     const file = fileInput.files[0];
     if(file.size > maxAllowedSize){
        showToast("Xan't upload more than 100MB")
        resetFileInput();
        return;
     }
     
     progressContainer.style.display = "block"
  
     const formData = new FormData()
     formData.append("myfile",file)
    const xhr =new XMLHttpRequest();
     xhr.onreadystatechange = () =>{
        if(xhr.readyState === XMLHttpRequest.DONE){
        console.log(xhr.readyState)
        onUploadSuccess(JSON.parse(xhr.response));
    }
     }
  
     xhr.upload.onprogress = updateprogress;
     xhr.upload.onerror = () =>{
       resetFileInput();
        showToast(`Error in Upload: ${xhr.statusText}`)
     }

     xhr.open("POST",uploadURL)
     xhr.send(formData)
}

const updateprogress = (e) =>{
    const percent = Math.round((e.loaded / e.total )* 100);
    // console.log(percent)
    bgProgress.style.width = `${percent}%`;
    percentDiv.innerText = percent;
    progressBar.style.transform = `sacleX(${percent/100})`
}

const onUploadSuccess= ({file: url})=>{
 console.log(url);
 fileInput.value = "";
 emailForm[2].removeAttribute("disabled", "true");
 progressContainer.style.display= "none";
 sharingContainer.style.display = "block";
 fileURLInput.value = url; 
}

const resetFileInput = () =>{

}

emailForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    console.log("submit Form");
    const url =fileURLInput.value;
    const formData = {
        uuid: url.split("/").splice(-1,1)[0],
        emailTo: emailForm.elements["to-email"].value,
        emailForm:emailForm.elements["from-email"].value,
    };

    emailForm[2].setAttribute("disabled", "true");

    console.table(formData);

    fetch(emailURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
    }).then((res)=>res.json())
      .then(({ success })=>{
        if(success){
            sharingContainer.style.display = "none";
            showToast("Email Sent")
        }
    })
});

let toastTimer;
const showToast = (msg)=>{
    toast.innerText = msg;
     toast.style.transform = "translate(-50%,0)";
     clearTimeout(toastTimer)
     toastTimer = setTimeout(()=>{
        toast.style.transform = "translate(-50%,60px)";

     },2000);
};