import React from 'react';
import './App.css'


class ListOfCards extends React.Component{
    constructor(){
        super();
        this.state = {
            deck_id : localStorage.getItem("deck_id"),
            passed_cards:[],
             bet: 10,
            score : 100
        }
        this.lower_bet = this.lower_bet.bind(this);
        this.compareCards = this.compareCards.bind(this);
        this.higher_bet = this.higher_bet.bind(this);
        this.update_bet = this.update_bet.bind(this);
        this.increaseScore = this.increaseScore.bind(this);
        this.decreaseScore = this.decreaseScore.bind(this);
        this.restart_game = this.restart_game.bind(this);
    }
    componentDidMount(){
        this.get_new_deck();
        
        
    }
    get_new_deck(){
        
       if(this.state.deck_id==null){
        fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1")
        .then(res=>res.json())
        .then((result) =>{
            
            localStorage.setItem("deck_id",result.deck_id);
            this.setState({
                passed_cards : [],  
                deck_id : result.deck_id
            },function(){
                this.draw_a_card();        
            })
            
        },
        (err)=>{
            console.log(err);
        })
       } else{
           
        fetch("https://deckofcardsapi.com/api/deck/"+this.state.deck_id+"/shuffle/")
        .then(res=>res.json())
        .then((result) =>{
            //console.log(result.deck_id);
            this.setState({
                
                deck_id : result.deck_id
            },function(){
                this.draw_a_card();        
            })
            
        },
        (err)=>{
            console.log(err);
        })
       }
        
    }
    async draw_a_card(){
        let card  = null;
        let url  = "https://deckofcardsapi.com/api/deck/"+this.state.deck_id+"/draw/?count=1";
      await fetch(url)
        .then(res => res.json())
        .then(result =>{
            //console.log(result);
            
            this.setState(prevStete =>({
                passed_cards : [...prevStete.passed_cards,result.cards[0]]
            }), function(){
                card = result.cards[0];
            })
        },
        err =>{
            console.log(err);
        });
        
        return card;
    }
    restart_game(){
        if(this.state.score===0){
            this.reset_game();
        }else{
            this.setState({
                passed_cards :[]
            })
            this.get_new_deck();
        }
    }

    reset_game(){
        this.setState({
            passed_cards :[],
            bet : 10,
            score : 100
        })
        document.getElementById("bet_input").value = 10;
        this.get_new_deck();
    }
     async lower_bet (e){
        if(this.state.bet>this.state.score || this.state.bet<=0){
                alert("Incorrect Bet!")
        }else{
            
        let last_card = this.state.passed_cards[this.state.passed_cards.length-1];
        let current_card = await this.draw_a_card();
         
         //console.log(current_card);
         //console.log(last_card);
         //console.log(this.state.passed_cards);
         let response  = this.compareCards(last_card,current_card);
          console.log(response);
         if(response==="<"){
            console.log("Correct!");
            this.increaseScore();
         }else if (response===">"){
             this.decreaseScore();
          setTimeout(()=>{
              alert("You lost!");
              this.restart_game();
            },600)
         }else{
          console.log("Correct!");
          this.increaseScore();
         }
          
        }

         
    }
    async higher_bet (e){
        if(this.state.bet>this.state.score || this.state.bet<=0){
            alert("Incorrect Bet!");
        }else {
            
        let last_card = this.state.passed_cards[this.state.passed_cards.length-1];
        let current_card = await this.draw_a_card();
         
         //console.log(current_card);
         //console.log(last_card);
         //console.log(this.state.passed_cards);
         let response  = this.compareCards(last_card,current_card);
          console.log(response);
         if(response==="<"){
             this.decreaseScore();
            setTimeout(()=>{
              alert("You lost!");
              this.restart_game();
            },600);
            
         }else if (response===">"){
         console.log("Correct!")
         this.increaseScore();
         }else{
          console.log("Correct!")
          this.increaseScore();
         }
        }
        

         
    }

    compareCards(last,current){

        let last_card_value,current_card_value;
        switch(current.value){
            case "ACE":
                current_card_value = 11;
                break; 
            case "KING":
                current_card_value = 14;
                break;  
            case "JACK":
                current_card_value = 12;
                break;
            case "QUEEN":
                    current_card_value = 13;
                    break;
            default :
            current_card_value = Number(current.value);   
        }
        switch(last.value){
            case "ACE":
                last_card_value = 11;
                break; 
            case "KING":
                last_card_value = 14;
                break;  
            case "JACK":
                last_card_value = 12;
                break;
            case "QUEEN":
                last_card_value = 13;
                    break;
            default :
            last_card_value = Number(last.value);   
        }
        console.log("Trenutna = " + current_card_value+";Prosla = "+last_card_value);
        if(current_card_value>last_card_value)return ">"
        else if(current_card_value<last_card_value)return "<"
        else return "=";

    }
    update_bet(e){
        console.log(e.target.value);
        this.setState({
            bet : Number(e.target.value)
        })
    }
    
increaseScore(){
let newScore = this.state.score + this.state.bet;
this.setState({
    score : newScore
})
}

decreaseScore(){
    let newScore = this.state.score - this.state.bet;
    this.setState({
        score : newScore
    })
    }
    render(){
        return(
            <div className="centered" >
                <div>
                    {this.state.passed_cards.map(function(item, i){
                       
                        return <img src = {item.image} key={i} alt={item.code}/>
                 })}
                </div>
                

               <div>
               <button onClick={this.lower_bet}>Lower</button>
                <button onClick={this.higher_bet}>Higher</button>
                <p>Score: {this.state.score}  coins</p>
                <p>Bet: <input id="bet_input" defaultValue={this.state.bet} onChange={this.update_bet}/> coins</p>
               </div>
            </div>
        )
    }

}
export default ListOfCards;
