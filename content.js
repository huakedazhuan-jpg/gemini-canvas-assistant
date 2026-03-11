(function () {

let imageBase64 = null
let imageMimeType = "image/png"

let trigger
let panel
let answerDiv
let imageBox

initUI()
bindEvents()

function initUI(){

    trigger = document.createElement("div")
    trigger.id="ai-ghost-trigger"
    trigger.innerHTML="AI"
    document.body.appendChild(trigger)

    panel = document.createElement("div")
    panel.id="ai-ghost-panel"

    panel.innerHTML=`
        <div id="ai-close">✕</div>
        <div id="ai-image-box">.</div>
        <button id="ai-ask">.</button>
        <div id="ai-answer"></div>
    `

    document.body.appendChild(panel)

    answerDiv = panel.querySelector("#ai-answer")
    imageBox = panel.querySelector("#ai-image-box")
}

function bindEvents(){

    trigger.onclick=openPanel

    panel.querySelector("#ai-close").onclick=closePanel

    panel.querySelector("#ai-ask").onclick=askAI

    document.addEventListener("paste",handlePaste)
}

function openPanel(){
    panel.style.right="0"
    trigger.style.opacity="0"
}

function closePanel(){
    panel.style.right="-260px"
    setTimeout(()=>trigger.style.opacity="1",300)
}

function handlePaste(e){

    if(panel.style.right!=="0px") return

    const items=e.clipboardData.items

    for(let item of items){

        if(item.type.indexOf("image")!==-1){

            const file=item.getAsFile()

            imageMimeType=file.type

            const reader=new FileReader()

            reader.onload=(event)=>{

                imageBase64=event.target.result.split(",")[1]

                imageBox.innerHTML = `<span style="opacity: 0.1">.</span>`;

            }

            reader.readAsDataURL(file)
        }
    }
}

async function askAI(){

    if(!imageBase64){
        answerDiv.innerText="无截图"
        return
    }

    answerDiv.innerText="..."

    try{

        const res=await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIyourApihere__sbsbsbsbssbsbssbsbsbssbsbsb",
        {
            method:"POST",
            headers:{ "Content-Type":"application/json" },

            body:JSON.stringify({

                contents:[{
                    parts:[
                        { text:"识别图片中的题目并只给出答案，每个答案一行。" },
                        {
                            inlineData:{
                                mimeType:imageMimeType,
                                data:imageBase64
                            }
                        }
                    ]
                }],

                generationConfig:{
                    temperature:0.1
                }

            })
        })

        const result=await res.json()

        if(result.candidates){

            answerDiv.innerText=
                result.candidates[0].content.parts[0].text

        }else{

            answerDiv.innerText=
                "API异常\n"+JSON.stringify(result,null,2)

        }

    }catch(e){

        answerDiv.innerText="连接失败"

    }
}

})()