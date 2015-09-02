var el = document.getElementById('talkback');
el.addEventListener('click', function() {
    if (window.speechSynthesis !== undefined) {
        var utterance = new SpeechSynthesisUtterance();
        utterance.voice = 'Google UK English Male';
        utterance.lang = 'en-GB';
        var issues = document.getElementsByClassName('talkback-content');

        if (issues.length > 0) {
        talkback = "";
        for (var i = 0; i < issues.length; i++) {
            if (i == 0) {
                talkback =  'Yesterday I resolved ';
            } else {
                talkback += " and ";
            }
            talkback += issues[i].innerHTML + ".";
        }

        talkback += " and I have no blockers";

        utterance.text = talkback;
        window.speechSynthesis.speak(utterance);
        }
    }
}, false);
