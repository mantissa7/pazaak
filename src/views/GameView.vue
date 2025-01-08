<script setup lang="ts">
  import { roll } from '@/utils/dice';

  type Card = {
    value: number;
    name: string;
  }

  enum Turn {
    Player = 0,
    Opponent = 1,
  }

  type Game = {
    turn: Turn,
    player: {
      score: number;
      grid: Card[],
      hand: Card[],
    },
    opponent: {
      score: number;
      grid: Card[],
      hand: Card[],
    },
  }

  const draw = () => {
    return roll(1, 10);
  }

  const endTurn = () => {
    // draw()
  }

  const stand = () => {
    // draw()
  }

  const deck: Card[] = new Array(8).fill(0).map(card => {
    const val = roll(1, 5);
    return {
      value: val,
      name: `+${val}`,
    };
  });

  const game: Game = {
    turn: Turn.Player,
    player: {
      score: 0,
      grid: [{ value: 1, name: '+1' }],
      hand: deck.slice(0, 4),
    },
    opponent: {
      score: 0,
      grid: [],
      hand: deck.slice(4),
    },
  }
</script>

<template>
  <main>
    <h1>PAZAAK</h1>

    <div class="meta">
      <div class="turn"></div>
      <div class="username">user 1</div>
      <div class="score">10</div>
      <div class="score">12</div>
      <div class="username">user 2</div>
      <div class="turn"></div>
    </div>

    <div class="game">
      <div class="field player-field">
        <div class="grid">
          <div
            v-for="(_, idx) in new Array(9).fill(0).map(card => null)"
            class="slot"
          >
            <div v-if="game.player.grid[idx]" class="card">
              {{ game.player.grid[idx].value }}
            </div>
          </div>
        </div>
        <div class="hand">
          <div
            v-for="card in game.player.hand"
            class="slot"
          >
            <div class="card">
              {{ card.name }}
            </div>
          </div>
        </div>
      </div>
      <div class="field opponent-field">
        <div class="grid">
          <div
            v-for="(_, idx) in new Array(9).fill(0).map(card => null)"
            class="slot"
          >
            <!-- {{ card.value }} -->
          </div>
        </div>
        <div class="hand">
          <div
            v-for="card in game.opponent.hand"
            class="slot"
          >
            <div class="card backface">

            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="commands">
      <button
        class="turn"
        @click="endTurn"
      >End Turn</button>
      <button
        class="stand"
        @click="stand"
      >Stand</button>
    </div>
  </main>
</template>

<style>
  .meta {
    display: grid;
    gap: 20px;
    grid-template-columns: 50px 1fr max-content max-content 1fr 50px;
    place-items: center;
    background: #aaa3;
    height: 40px;
    margin-bottom: 16px;

    .score {
      background: #000;
      border: 10px solid #000;
      padding: 0 20px;
      border-radius: 12px;
    }
  }

  .game {
    --card-ratio: 3/4;

    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;

    .field {
      display: grid;
      grid-template-rows: 1fr max-content;
      gap: 20px;

      .grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        grid-template-rows: 1fr 1fr 1fr;
        gap: 16px;

        .slot {
          display: grid;
          place-items: center;
          aspect-ratio: var(--card-ratio);
          border-radius: 8px;
          border: 1px solid #666;
          min-width: 100px;

        }
      }

      .hand {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10px;
        background: black;
        border-radius: 8px;
        padding: 20px;

        .slot {
          display: grid;
          aspect-ratio: var(--card-ratio);
          border-radius: 8px;
          border: 1px solid #666;
          min-width: 100px;

          .card {
            display: grid;
            place-items: center;
            background-color: #333;

            &.backface {
              background: #222;
            }
          }
        }
      }
    }
  }

  .commands {
    position: fixed;
    inset: auto 0 0 0;
    height: 100px;
    display: grid;
    place-content: center;
    gap: 40px;
    grid-auto-flow: column;
    background-color: #aaa3;

    button {
      border: 1px solid #fff;
      background: var(--background-colour);
      color: #fff;
      padding: 10px 20px;
      border-radius: 8px;
    }
  }
</style>