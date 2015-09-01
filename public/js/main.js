var el = document.getElementById('talkback');
el.addEventListener('click', function() {
    if (window.speechSynthesis !== undefined) {
        var utterance = new SpeechSynthesisUtterance();
        utterance.voice = 'Google UK English Male';
        utterance.lang = 'en-GB';
        utterance.text = 'Yesterday I resolved';
        window.speechSynthesis.speak(utterance);
    }
}, false);
