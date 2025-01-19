<script setup lang="ts">
    import type { CardType } from '@/game';

    defineProps<{
        value: number;
        name: string;
        type: CardType;
    }>();
</script>

<template>
    <div
        class="card"
        :class="[type]"
    >
        <div class="label">
            {{ name }}
        </div>
    </div>
</template>

<style scoped>
    .card {
        display: grid;
        align-items: center;
        justify-content: stretch;
        background: rgb(141, 25, 25);
        border: 10px solid grey;
        border-radius: 6px;

        &.plus {
            background: rgb(58, 141, 25);
        }

        &.minus {
            background: rgb(141, 25, 25);
        }

        &.plusminus {
            background: yellow;
        }

        .label {
            background: #000;
            border: 5px solid grey;
            border-radius: 6px;
            display: grid;
            place-items: center;
            height: 60px;
        }
    }
</style>