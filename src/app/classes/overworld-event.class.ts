import { Battle } from "../battle/battle.class";
import { SceneTransition } from "./scene-transition.class";
import { TextMessage } from "./text-message.class";
import { Enemies } from "../shared/utils";
import { PauseMenu } from "./pause-menu.class";
import { playerState } from "../shared/player-state";
import { CraftingMenu } from "./crafting-menu.class";
import { KeyboardMenu } from "./keyboard-menu.class";
import { Actions } from "../shared/utils";

export class OverworldEvent {
  map;
  event;
  keyboardMenu: any;
  quantityMap: any = {}
  items: any;

  constructor({ map, event }: any) {
    this.map = map;
    this.event = event;

    // Condense multiple quantities of the same player items stored in playerState (ex.
    // display 'Cheese x 2' instead of 'Cheese, Cheese')
    playerState.items.forEach((item: any) => {
      // if (item.team === caster.team) {
      let existing = this.quantityMap[item.actionId];
      if (existing) {
        existing.quantity += 1;
      } else {
        this.quantityMap[item.actionId] = {
          actionId: item.actionId,
          quantity: 1,
          instanceId: item.instanceId,
        }
      }
      // }
    });
    this.items = Object.values(this.quantityMap);
  }

  init(): Promise<any> {
    return new Promise(resolve => {
      let key = this.event.type
      this[key as keyof OverworldEvent](resolve);
    });
  }

  stand(resolve: any): void {
    const who = this.map.gameObjects[this.event.who];
    who.startBehavior(
      {
        map: this.map,
      },
      {
        type: 'stand',
        direction: this.event.direction,
        time: this.event.time,
      },
    );

    // Set up a handler to complete when correct person is done walking, then resolve the
    // event/Promise
    const completeHandler = (e: any) => {
      if (e.detail.whoId === this.event.who) {
        document.removeEventListener('PersonStandingComplete', completeHandler);
        resolve();
      }
    }

    document.addEventListener('PersonStandingComplete', completeHandler);
  }

  walk(resolve: any): void {
    const who = this.map.gameObjects[this.event.who];
    who.startBehavior(
      {
        map: this.map,
      },
      {
        type: 'walk',
        direction: this.event.direction,
        retry: true,
      },
    );

    // Set up a handler to complete when the correct person, identified by who & whoId, is 
    // done walking, then resolve the event/Promise
    const completeHandler = (e: any) => {
      if (e.detail.whoId === this.event.who) {
        document.removeEventListener('PersonWalkingComplete', completeHandler);
        resolve();
      }
    }

    document.addEventListener('PersonWalkingComplete', completeHandler);
  }

  textMessage(resolve: any): void {
    if (this.event.faceHero) {
      const obj = this.map.gameObjects[this.event.faceHero];
      obj.direction = oppositeDirection(this.map.gameObjects['hero'].direction);
    }

    const message = new TextMessage({
      text: this.event.text,
      onComplete: () => resolve(),
    });
    message.init(document.querySelector('.game-container'));
  }

  changeMap(resolve: any): void {
    const sceneTransition = new SceneTransition();
    sceneTransition.init(document.querySelector('.game-container'), () => {

      // console.log('--- this.event:', this.event);
      
      this.map.overworld.startMap((<any>window).OverworldMaps[this.event.map], {
        x: this.event.x,
        y: this.event.y,
        direction: this.event.direction,
      });
      resolve();

      sceneTransition.fadeOut();
    });
  }


  // changeMap(resolve) {

  //   const sceneTransition = new SceneTransition();
  //   sceneTransition.init(document.querySelector(".game-container"), () => {
  //     this.map.overworld.startMap( window.OverworldMaps[this.event.map], {
  //       x: this.event.x,
  //       y: this.event.y,
  //       direction: this.event.direction,
  //     });
  //     resolve();

  //     sceneTransition.fadeOut();

  //   })
  // }
  
  

  battle(resolve: any): void {
    const battle = new Battle({
      enemy: Enemies[this.event.enemyId as keyof typeof Enemies],
      onComplete: (wonBattle: boolean) => {
        resolve(wonBattle ? 'WON_BATTLE' : 'LOST_BATTLE');
      }
    });
    // const battle = new Battle();
    battle.init(document.querySelector('.game-container'));
  }

  pause(resolve: any): void {
    this.map.isPaused = true;
    const menu = new PauseMenu({
      progress: this.map.overworld.progress,
      onComplete: () => {
        resolve();
        this.map.isPaused = false;
        this.map.overworld.startGameLoop();
      },
    });
    menu.init(document.querySelector('.game-container'));
  }

  addStoryFlag(resolve: any): void {
    (playerState.storyFlags as any)[this.event.flag] = true;
    resolve();
  }

  craftingMenu(resolve: any) {
    const menu = new CraftingMenu({
      pizzas: this.event.pizzas,
      onComplete: () => {
        resolve();
      }
    });
    menu.init(document.querySelector('.game-container'));
  }

  openChest(resolve: any): void {
    this.keyboardMenu = new KeyboardMenu();
    this.keyboardMenu.init(document.querySelector('.game-container'));
    this.keyboardMenu.setOptions(this.getContainerOptions(resolve).mainMenu);

    console.log('--- this.event:', this.event);

    // resolve();
    
  }

  getContainerOptions(resolve: any) {

    console.log('--- playerState:', playerState);
    
    const backOption = {
      label: 'Go back',
      description: 'Return to previous page',
      handler: () => {
        this.keyboardMenu.setOptions(this.getContainerOptions(resolve).mainMenu);
      }
    }

    return {
      mainMenu: [ 
        {
          label: 'Deposit',
          description: 'Place items in this chest',
          handler: () => {
            this.keyboardMenu.setOptions(this.getContainerOptions(resolve).items);
          }
        },
        {
          label: 'Withdraw',
          description: 'Take items from this chest',
          handler: () => {
  
          }
        },
        {
          label: 'Pick up chest',
          description: 'Pick up this chest',
          handler: () => {
  
          }
        },
      ],

      // Display items in the player's inventory that can be deposited
      items: [
        ...this.items.map((item: any) => {
          
          // Note: items are stored under the shared Actions object
          const action = Actions[item.actionId as keyof typeof Actions];
          return {
            label: action.name,
            description: action.description,
            right: () => {
              return "x"+item.quantity;
            },
            handler: () => {
              this.depositItem(action, item.instanceId, resolve);
            }
          }
        }),
        backOption,
      ],
      
    }
  }



  depositItem(action: any, instanceId = null, resolve: any) {
    
    // console.log('--- action:', action);
    // console.log('--- instanceId:', instanceId);
    // const x = playerState.items.find(item => item.instanceId === instanceId)
    let itemToBeDeposited: any[] = [];
    playerState.items.forEach((item, i) => {
      if (item.instanceId === instanceId) {
        itemToBeDeposited = playerState.items.splice(i, 1);
      }
    });

    // console.log('--- playerState.items:', playerState.items);
    // console.log('--- itemToBeDeposited:', itemToBeDeposited);

    let chest = (<any>window).OverworldMaps.HomeCave.gameObjects.chest1

    chest.items.push(...itemToBeDeposited);

    console.log('--- chest.items:', chest.items);
    console.log('--- playerState:', playerState);
  
      
    this.keyboardMenu?.end();
    resolve();
  }
}

// ========== Utility Functions ===============================================================

function oppositeDirection(direction: string) {
  if (direction === 'left') { return 'right' }
  if (direction === 'right') { return 'left' }
  if (direction === 'up') { return 'down' }
  return 'up'
}


