!function(e){var a={};function n(t){if(a[t])return a[t].exports;var o=a[t]={i:t,l:!1,exports:{}};return e[t].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=e,n.c=a,n.d=function(e,a,t){n.o(e,a)||Object.defineProperty(e,a,{enumerable:!0,get:t})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,a){if(1&a&&(e=n(e)),8&a)return e;if(4&a&&"object"==typeof e&&e&&e.__esModule)return e;var t=Object.create(null);if(n.r(t),Object.defineProperty(t,"default",{enumerable:!0,value:e}),2&a&&"string"!=typeof e)for(var o in e)n.d(t,o,function(a){return e[a]}.bind(null,o));return t},n.n=function(e){var a=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(a,"a",a),a},n.o=function(e,a){return Object.prototype.hasOwnProperty.call(e,a)},n.p="",n(n.s=0)}([function(e,a,n){console.log("starting text-mode client"),$(document).ready((function(){var e=n(1),a={},t={mods:{style:"mods",members:["160400130","166713997","164390292","129190457","134640094","178144832","42367965"]},hime:{style:"hime",members:["47735570"]},vale:{style:"vale",members:["27645199"]},jacca:{style:"jacca",members:["76912664"]},juice:{style:"juice",members:["100783701"]},chaos:{style:"chaos",members:["162500120"]},z00z:{style:"overlord",members:["81500175"]},bday:{style:"bday",members:[]},president:{style:"president",members:["174913952"]}},o={chatBox:$(".chat-box"),movieBox:$(".movie-box"),stale:$("#alleluia-stale"),messages:$("#alleluia-messages"),inputBox:$("#alleluia-input"),emoteBtn:$("#alleluia-emotes"),emoteBox:$("#alleluia-emote-menu")},s={":contentTap:":{path:"/images/valemotes/contentTap.gif"},":contentKeyTap:":{path:"/images/valemotes/contentKeyTap.gif"},":valeAYAYA:":{path:"/images/valemotes/valeAYAYA.png"},":valeBaka:":{path:"/images/valemotes/valeBaka.png"},":valeBattle:":{path:"/images/valemotes/valeBattle.png"},":valeBite:":{path:"/images/valemotes/valeBite.png"},":valeBlush:":{path:"/images/valemotes/valeBlush.png"},":valeBooli:":{path:"/images/valemotes/valeBooli.png"},":valeCheer:":{path:"/images/valemotes/valeCheer.png"},":valeCool:":{path:"/images/valemotes/valeCool.png"},":valeComfy:":{path:"/images/valemotes/valeComfy.png"},":valeCry:":{path:"/images/valemotes/valeCry.png"},":valeEvil:":{path:"/images/valemotes/valeEvil.png"},":valeD:":{path:"/images/valemotes/valeD.png"},":valeDabL:":{path:"/images/valemotes/valeDabL.png"},":valeDabR:":{path:"/images/valemotes/valeDabR.png"},":valeEdgy:":{path:"/images/valemotes/valeEdgy.png"},":valeFail:":{path:"/images/valemotes/valeFail.png"},":valeFine:":{path:"/images/valemotes/valeFine.png"},":valeGasm:":{path:"/images/valemotes/valeGasm.png"},":valeGiggle:":{path:"/images/valemotes/valeGiggle.png"},":valeGiggles:":{path:"/images/valemotes/valeGiggles.gif"},":valeGG:":{path:"/images/valemotes/valeGG.png"},":valeGrrr:":{path:"/images/valemotes/valeGrrr.png"},":valeHug:":{path:"/images/valemotes/valeHug.png"},":valeHype:":{path:"/images/valemotes/valeHype.png"},":valeLewd:":{path:"/images/valemotes/valeLewd.png"},":valeLove:":{path:"/images/valemotes/valeLove.png"},":valeLoves:":{path:"/images/valemotes/valeLoves.gif"},":valeLurk:":{path:"/images/valemotes/valeLurk.png"},":valeNano:":{path:"/images/valemotes/valeNano.png"},":valeNeko:":{path:"/images/valemotes/valeNeko.png"},":valeNom:":{path:"/images/valemotes/valeNom.png"},":valeOoh:":{path:"/images/valemotes/valeOoh.png"},":valePanic:":{path:"/images/valemotes/valePanic.png"},":valePanics:":{path:"/images/valemotes/valePanics.gif"},":valeParty:":{path:"/images/valemotes/valeParty.png"},":valeParties:":{path:"/images/valemotes/valeParties.gif"},":valeowValeHealsGoodMan:":{path:"/images/valemotes/valeowValeHealsGoodMan.png"},":valeRiot:":{path:"/images/valemotes/valeRiot.png"},":valeRIP:":{path:"/images/valemotes/valeRIP.png"},":valeS:":{path:"/images/valemotes/valeS.png"},":valeShrug:":{path:"/images/valemotes/valeShrug.png"},":valeSip:":{path:"/images/valemotes/valeSip.png"},":valeSmug:":{path:"/images/valemotes/valeSmug.png"},":valeStudy:":{path:"/images/valemotes/valeStudy.png"},":valeTaxic:":{path:"/images/valemotes/valeTaxic.png"},":valeThink:":{path:"/images/valemotes/valeThink.png"},":valeWave:":{path:"/images/valemotes/valeWave.png"},":valeWingL:":{path:"/images/valemotes/valeWingL.png"},":valeWingR:":{path:"/images/valemotes/valeWingR.png"},":valeWow:":{path:"/images/valemotes/valeWow.png"},":valeYo:":{path:"/images/valemotes/valeYo.png"},":valeZZZ:":{path:"/images/valemotes/valeZZZ.png"}},l=function(e){return e.scrollHeight-e.scrollTop-e.clientHeight<=1},i=function(e,a,n){var t=!l(o.messages[0]),i=$("<div>").addClass("alleluia-line").addClass("alleluia-line-"+e);n=function(e){var a,n="",t=0,o=/(?::vale|:content).*?:/g;do{(a=o.exec(e))&&s[a[0]]&&(n+=e.substring(t,a.index),n+='<img class="emote" src="'.concat(s[a[0]].path,'" alt="').concat(a[0],'"/>'),t=a.index+a[0].length)}while(a);return n+e.substring(t)}(n);a=$("<span>").addClass("alleluia-name").html(a),n=$("<span>").addClass("alleluia-body").html(n);a.appendTo(i),n.appendTo(i),i.appendTo(o.messages),t?o.stale.removeClass("hidden"):(o.stale.addClass("hidden"),i[0].scrollIntoView())};e.init();var r={};e.onDisconnect((function(e){console.log("disconnect for: ".concat(e)),i("sys","Part",r[e]),delete r[e]})),e.onJoin((function(e){console.log("join caught ..."),r[e.uid]=e.name,i("sys","Join",e.name)})),e.onMessage((function(e,n){var o=function(e){var a="default";for(var n in t)if(t.hasOwnProperty(n)&&t[n].members.includes(e)){a=t[n].style;break}return a}(a[e.uid]),s=e.name;"hime"===o&&(s="『hime-chan』"),i(o,s,function(e){return e&&"string"==typeof e?e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"):e}(n))})),e.onTag((function(e){switch(e.key){case"x-twitch-id":var n=e.uid.UserById.uid;a[n]=JSON.parse(e.value);break;default:console.log("the bootstrap client understands NOTHING !!!")}})),o.inputBox.on("keyup",(function(a){if(13===a.keyCode){var n=o.inputBox.val();switch(o.inputBox.val(""),n){case"/users":return void function(){for(var e in r)i("sys","System",r[e])}()}e.sendMessage(n)}})),o.emoteBtn.on("click",(function(e){o.emoteBox.removeClass("hidden"),e.stopPropagation()})),o.chatBox.on("click",(function(){o.emoteBox.addClass("hidden")})),o.chatBox.on("keyup",(function(e){27===e.keyCode&&o.emoteBox.addClass("hidden")})),o.messages.on("scroll",(function(e){l(o.messages[0])&&o.stale.addClass("hidden")}));var v=function(){if(!s.hasOwnProperty(g))return"continue";var e=g,a=s[g].path,n=$("<div>"),t=$("<img>");t.attr("src",a),t.addClass("emote"),t.appendTo(n),t.on("click",(function(a){console.log("clicked on: "+e),o.inputBox.val("".concat(o.inputBox.val()," ").concat(e)),a.stopPropagation()})),n.appendTo(o.emoteBox)};for(var g in s)v()}))},function(e,a,n){var t=n(2);e.exports.init=function(){console.log("starting up"),t.init()},e.exports.onDisconnect=t.onDisconnect,e.exports.onJoin=t.onJoin,e.exports.onMessage=t.onMessage,e.exports.onTag=t.onTag,e.exports.isOwnID=t.isOwnID,e.exports.sendMessage=t.sendMessage,e.exports.sendTag=t.sendTag},function(e,a,n){var t=n(3);e.exports=function(){var e,a,n,o,s={},l=null,i="wss://valestream.fatalsyntax.com/kyrie",r=!1,v="",g="",m="";function p(e){void 0!==o&&o(e)}return s.init=function(){console.log("starting client ..."),function(o){if(r)return void console.log("you're already connected");console.log("connecting to kyrie @ "+i),l=new WebSocket(i),r=!r,l.onerror=function(e){console.error(e)},l.onmessage=function(t){var s,l,i,r=JSON.parse(t.data);if(void 0!==r.TagUser)p({uid:(r=r.TagUser).destination,key:r.key,value:r.tag});else if(void 0!==r.Notice){s=(r=r.Notice).payload,l=r.destination,null===r.from&&null!==typeof l.UserById&&0===s.indexOf("welcome")&&(v=l.UserById.uid,o())}else if(void 0!==r.Join){var g=(r=r.Join).uid;for(var c in m=r.channel,g.tags)g.tags.hasOwnProperty(c)&&p({uid:{UserById:{uid:g.uid}},key:c,value:g.tags[c]});!function(e){void 0!==a&&a(e)}(g),i=g.name+" has joined #"+m+".",console.warn(i)}else if(void 0!==r.Disconnect){var u=(r=r.Disconnect).uid[0];i=r.uid[1]+" has disconnected: "+r.reason+".",function(a){void 0!==e&&e(a)}(u),console.warn(i)}else if(void 0!==r.ChatMessage){s=(r=r.ChatMessage).payload;var d={uid:r.from[0],name:r.from[1]};console.log("got message: "+s),function(e,a){void 0!==n&&n(e,a)}(d,s)}},l.onopen=function(){g=$("#alleluia-connect-name").val();var e=t.registerUser(g);l.send(JSON.stringify(e))}}((function(){!function(){var e={Resource:{method:"Subscribe",path:"/rooms/"+(m="movienight"),payload:null}};l.send(JSON.stringify(e))}(),s.sendTag("x-twitch-id",$("#alleluia-connect-id").val())}))},s.isOwnID=function(e){return v===e},s.onDisconnect=function(a){e=a},s.onJoin=function(e){a=e},s.onMessage=function(e){n=e},s.onTag=function(e){o=e},s.sendMessage=function(e){""!==e?l.send(JSON.stringify(t.chatMessage(m,g,e))):console.warn("cowardly refusing to send blank message")},s.sendTag=function(e,a){l.send(JSON.stringify(t.tagUser(v,m,e,a)))},s}()},function(e,a){e.exports={registerUser:function(e){var a={name:e};return{Resource:{method:"Put",path:"/self/registration",payload:JSON.stringify(a)}}},targetRoom:function(e){return{RoomByName:{name:e}}},tagUser:function(e,a,n,t){return{Resource:{method:"Publish",path:"/rooms/"+a+"/"+e+"/tag/"+n,payload:JSON.stringify(t)}}},chatMessage:function(e,a,n){return{Resource:{method:"Publish",path:"/rooms/"+e+"/messages",payload:n}}}}}]);
//# sourceMappingURL=bundle.js.map