import { Combatant } from "./combatant.class";

// TODO: this already exists in src/app/content/pizzas.ts, refactor into a helper function
// to set up global pizza variables
(<any>window).PizzaTypes = {
  normal: 'normal', 
  spicy: 'spicy', 
  veggie: 'veggie', 
  fungi: 'fungi', 
  chill: 'chill', 
};

(<any>window).Pizzas = {
  's001': {
    name: 'Slice Samurai',
    type: (<any>window).PizzaTypes.spicy,
    src: 'assets/pizzas/s001.png',
    icon: 'assets/pizza-icons/spicy.png',
  },
  'v001': {
    name: 'Call Me Kale',
    type: (<any>window).PizzaTypes.veggie,
    src: 'assets/pizzas/v001.png',
    icon: 'assets/pizza-icons/veggie.png',
  },
  'f001': {
    name: 'Portobello Express',
    type: (<any>window).PizzaTypes.fungi,
    src: 'assets/pizzas/f001.png',
    icon: 'assets/pizza-icons/fungi.png',
  },
}

export class Battle {
  element: any;
  combatants: any;

  constructor() {
    this.combatants = {
      'player1': new Combatant({
        ...(<any>window).Pizzas['s001'],
        team: 'player',
        hp: 50,
        maxHp: 50,
        xp: 0,
        level: 1,
        status: null,
        // status: {
        //   type: 'clumsy',
        //   expiresIn: 3,
        // }
      }, this),
      'enemy1': new Combatant({
        ...(<any>window).Pizzas.v001,
        team: 'enemy',
        hp: 50,
        maxHp: 50,
        xp: 20,
        level: 1,
      }, this),
      'enemy2': new Combatant({
        ...(<any>window).Pizzas.f001,
        team: 'enemy',
        hp: 50,
        maxHp: 50,
        xp: 30,
        level: 1,
      }, this),
    }
  }

  init(container: any): void {
    this.createElement();
    container.appendChild(this.element);

    Object.keys(this.combatants).forEach(key => {
      let combatant = this.combatants[key];
      combatant.id = key;
      combatant.init(this.element);
    });
  }
  
  createElement() {
    this.element = document.createElement('div');
    this.element.classList.add('Battle');
    this.element.innerHTML = `
      <div class="Battle_hero">
        <img src="${'assets/character-01.webp'}" alt="Hero" />
      </div>
      <div class="Battle_enemy">
        <img src="${'assets/character-01.webp'}" alt="Enemy" />
      </div>
    `
  }
  
}