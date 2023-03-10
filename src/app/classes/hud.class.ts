import { playerState } from "../shared/player-state";
import { Combatant } from "../battle/combatant.class";
import { Pizzas } from "../shared/utils";

export class Hud {
  element: any;
  scoreboards: any;

  constructor() {
    this.scoreboards = [];
  }

  init(container: any): void {
    this.createElement();
    container.appendChild(this.element);

    // Anytime the player state changes, this listener detects the change event and
    // then calls update() to update the Overworld HUD
    document.addEventListener('PlayerStateUpdated', () => {
      this.update();
    });

    // When the pizza lineup changes, notify the HUD so the HP & XP bars are updated
    document.addEventListener('LineupChanged', () => {
      this.createElement();
      container.appendChild(this.element);
    })
  }

  createElement(): void {

    if (this.element) {
      this.element.remove();
      this.scoreboards = [];
    }
    
    this.element = document.createElement('div');
    this.element.classList.add('Hud');

    playerState.lineup.forEach((key: any) => {
      const pizza = (playerState.pizzas as any)[key];

      // TODO - create a separate HUD instead of re-using the one in the Combatant class
      const scoreboard = new Combatant({
        id: key,
        ...(Pizzas as any)[pizza.pizzaId],
        ...pizza,

      }, null);
      scoreboard.createElement();
      this.scoreboards.push(scoreboard);
      this.element.appendChild(scoreboard.hudElement);
    });
    this.update();
  }

  update(): void {
    this.scoreboards.forEach((s: any) => {

      // Update scoreboard here
      s.update((playerState.pizzas as any)[s.id])
      
    });
  }
}