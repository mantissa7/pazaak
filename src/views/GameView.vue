<script setup lang="ts">
  import { pazaak, Turn, type Game } from '@/game';
  import CardUI from '@/components/Card.vue';
  import { ref, toRaw } from 'vue';

  const game = ref<Game>();

  pazaak.begin((_game) => {
    console.log(_game)
    game.value = structuredClone(_game);
  });



  const handleEndTurn = async () => {
    if (game.value?.turn === Turn.Player) {
      pazaak.endTurn();
    }
  }

  const handleStand = () => {
    if (game.value?.turn === Turn.Player) {
      pazaak.stand();
    }
  }

</script>

<template>
  <main>
    <h1>PAZAAK</h1>

    <div class="meta">
      <div
        class="turn"
        :class="{ active: game?.turn === Turn.Player }"
      ></div>
      <div class="username">Player</div>
      <div class="score">{{ pazaak.gridSum(game?.player.grid ?? []) }}</div>
      <div class="score">{{ pazaak.gridSum(game?.opponent.grid ?? []) }}</div>
      <div class="username">{{ game?.opponent.username }}</div>
      <div
        class="turn"
        :class="{ active: game?.turn === Turn.Opponent }"
      ></div>
    </div>

    <div class="game">
      <div class="field player-field">
        <div class="grid">
          <div
            v-for="(_, idx) in new Array(9).fill(0).map(card => null)"
            class="slot"
          >
            <CardUI
              v-if="game?.player.grid[idx]"
              :value="game?.player.grid[idx].value"
              :name="game?.player.grid[idx].name"
              :type="game?.player.grid[idx].type"
            />
          </div>
        </div>
        <div class="hand">
          <div
            v-for="(card, i) in game?.player.hand"
            class="slot"
            :class="{ played: card.played === true }"
            @click="() => pazaak.playHand(toRaw(card), i)"
          >
            <CardUI
              :value="card.value"
              :name="card.name"
              :type="card.type"
            />
          </div>
        </div>
      </div>
      <div class="field opponent-field">
        <div class="grid">
          <div
            v-for="(_, idx) in new Array(9).fill(0).map(card => null)"
            class="slot"
          >
            <CardUI
              v-if="game?.opponent.grid[idx]"
              :value="game?.opponent.grid[idx].value"
              :name="game?.opponent.grid[idx].name"
              :type="game?.opponent.grid[idx].type"
            />
          </div>
        </div>
        <div class="hand">
          <div
            v-for="card in game?.opponent.hand"
            class="slot"
          >
            <div
              class="card backface"
              :class="{ played: card.played }"
            >

            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="commands">
      <button
        class="turn"
        @click="handleEndTurn"
      >End Turn</button>
      <button
        class="stand"
        @click="handleStand"
      >Stand</button>
    </div>
  </main>
</template>

<style scoped>
  .meta {
    display: grid;
    gap: 20px;
    grid-template-columns: 50px 1fr max-content max-content 1fr 50px;
    place-items: center;
    background: #aaa3;
    height: 40px;
    margin-bottom: 16px;

    .turn {
      width: 30px;
      background: red;
      aspect-ratio: 1 / 1;
      border-radius: 30px;
      opacity: 0.2;

      &.active {
        opacity: 1;
      }
    }

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

          &.played {
            opacity: 0.3;
            cursor: not-allowed;
            pointer-events: none;
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
      cursor: pointer;
    }
  }
</style>