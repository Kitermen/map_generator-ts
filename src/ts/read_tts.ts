const read_tts = (text: string) => {
    let voices = speechSynthesis.getVoices();

    const speak = ()=>{
        voices = voices.filter(x => x.lang === 'ja-JP');
        console.log(voices);
        let utterance = new SpeechSynthesisUtterance(text);
        utterance.pitch = 1.2
        utterance.rate = 1.1
        utterance.voice = voices[0];

        speechSynthesis.speak(utterance);
    }
    
    if(!voices.length){
        window.speechSynthesis.onvoiceschanged = () => {
            voices = speechSynthesis.getVoices();
            speak();
        };
    }
    else speak();
}

export default read_tts;