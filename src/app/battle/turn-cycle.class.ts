export class TurnCycle {
  battle: any;
  onNewEvent;
  currentTeam;

  constructor({ battle, onNewEvent }: any) {
    this.battle = battle;
    this.onNewEvent = onNewEvent;
    this.currentTeam = 'player'; // can be 'player' or 'enemy'
  }

  async init() {
    await this.onNewEvent({
      type: 'textMessage',
      text: 'The battle is starting!',
    });

    // Start the first turn!
    this.turn();
  }

  async turn() {

  }
  
}