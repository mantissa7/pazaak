import { roll } from "./utils/dice";
import { wait } from "./utils/wait";

export enum CardType {
	PLUS = "plus",
	MINUS = "minus",
	PLUSMINUS = "plusminus",
}

export type Card = {
	value: number;
	name: string;
	type: CardType;
};

export type HandCard = Card & {
	played: boolean;
};

export enum Turn {
	Player = 0,
	Opponent = 1,
}

export enum PlayState {
	Play = 0,
	Stand = 1,
}

export type Player = {
	state: PlayState;
	score: number;
	wins: number;
	grid: Card[];
	hand: HandCard[];
	username: string;
};

export type Game = {
	turn: Turn;
	player: Player;
	opponent: Player;
};

// const mockSideDeck: Card[] = [
// 	{
// 		value: val,
// 		name: `+${val}`,
// 		type: type,
// 	},
// ];

class FakeSocket<T = unknown> {
	subscribers: ((val: T) => void)[] = [];

	public subscribe(handler: (val: T) => void) {
		this.subscribers.push(handler);
	}

	public next(val: T) {
		for (const sub of this.subscribers) {
			sub(val);
		}
	}
}

class Pazaak {
	#game: Game;
	socket = new FakeSocket<Game>();

	constructor() {
		this.#game = {
			turn: Turn.Player,
			player: {
				state: PlayState.Play,
				score: 0,
				wins: 0,
				grid: [this.draw()],
				hand: this.makeHand().map((card) => ({ ...card, played: false })),
				username: "Player",
			},
			opponent: {
				state: PlayState.Play,
				score: 0,
				wins: 0,
				grid: [],
				hand: this.makeHand().map((card) => ({ ...card, played: false })),
				username: "DogVision",
			},
		};
	}

	async begin(handler: (val: Game) => void) {
		// Execute on next microtask, non-blocking to allow subscribers to attach
		// This just mocks the websocket sending queued events.
		// wait(3000)
		// 	.then(async () => {
		// 		this.socket.next(this.#game);
		// 		await wait(3000);
		// 		this.socket.next(this.#game);
		// 	})
		// 	.catch(() => null);

		const lstner = this.socket.subscribe(handler);
		this.socket.next(this.#game);
		return lstner;
	}

	private draw(): Card {
		const val = roll(1, 10);
		return {
			value: val,
			name: val.toString(),
			type: CardType.PLUS,
		};
	}

	// Take the full chosen side-deck and return 4 cards randomly
	private makeHand(): Card[] {
		const formatter = new Intl.NumberFormat("en-GB", {
			style: "decimal",
			signDisplay: "always",
		});

		return new Array(4).fill(0).map(() => {
			const rng = roll(1, 5);
			const type = Math.random() > 0.5 ? CardType.PLUS : CardType.MINUS;
			const val = type === CardType.MINUS ? -1 * rng : rng;
			return {
				value: val,
				name: formatter.format(val),
				// name: `+${val}`,
				type: type,
			};
		});
	}

	private async aiTurn() {
		// - Draw opponent card.
		this.#game.turn = Turn.Opponent;
		await wait(500);

		this.#game.opponent.grid.push(await this.draw());
		let grid = this.gridSum(this.#game.opponent.grid);

		// AI choice starts
		// If player ends turn over 20
		if (this.gridSum(this.#game.player.grid) > 20) {
			this.#game.opponent.state = PlayState.Stand;
			return;
		}

		if (
			this.#game.player.state === PlayState.Stand &&
			grid > this.gridSum(this.#game.player.grid)
		) {
			this.#game.opponent.state = PlayState.Stand;
			console.log("Opponent wins, stands.");
			return;
		}

		await wait(1000);
		if (grid >= 20) {
			this.#game.opponent.state = PlayState.Stand;
			console.log("Opponent stands");
			return;
		}

		// - Decide whether to use hand.
		let candidate: Card | null = null;
		for (const card of this.#game.opponent.hand) {
			if (
				grid >= 15 &&
				grid + card.value <= 20 &&
				grid + card.value > (candidate?.value ?? 0)
			) {
				candidate = card;
			}
		}

		this.socket.next(this.#game);
		await wait(1000);
		if (candidate !== null) {
			grid += candidate.value;
			this.#game.opponent.grid.push(candidate);
			console.log(`Opponent plays hand: ${candidate.name}`);
		}

		// - End turn or stand.
		if (grid >= 17) {
			if (roll(1, 10) > 5) {
				this.#game.opponent.state = PlayState.Stand;
				console.log("Opponent stands");
			}
		}

		console.log("Opponent ends turn");
	}

	async stand() {
		this.#game.player.state = PlayState.Stand;
		this.endTurn();
	}

	async endRound() {
		const playerSum = await this.gridSum(this.#game.player.grid);
		const opSum = await this.gridSum(this.#game.opponent.grid);

		if (playerSum > 20) {
			// player lose
			alert("Opponent Wins");
			return;
		}
		if (opSum > 20) {
			// opponent lose
			alert("Player Wins");
			return;
		}
		if (opSum === playerSum) {
			// draw
			alert("draw");
			return;
		}

		if (opSum > playerSum) {
			alert("Opponent Wins");
			return;
		}

		alert("Player Wins");
	}

	async playHand(card: HandCard, handIdx: number) {
		if (this.#game.turn !== Turn.Player) {
			return;
		}
		console.log("play hand");

		// set card to played
		this.#game.player.hand[handIdx].played = true;
		// card.played = true;

		// add card to deck
		// this.#game.player.grid.push(card);
		this.#game.player.grid = [...this.#game.player.grid, card];

		if (this.gridSum(this.#game.player.grid) === 20) {
			// Hit 20, auto-stand
			this.stand();
		}

		this.socket.next(this.#game);
	}

	async endTurn() {
		this.#game.turn = Turn.Opponent;

		if (this.#game.opponent.state === PlayState.Play) {
			console.log("ai turn");
			await this.aiTurn();
		}

		if (
			this.#game.player.state === PlayState.Stand &&
			this.#game.opponent.state === PlayState.Stand
		) {
			console.log("end round");
			this.endRound();
			this.socket.next(this.#game);
			return;
		}

		if (this.#game.player.state === PlayState.Play) {
			console.log("Player turn");
			// Player's turn.
			this.#game.player.grid.push(await this.draw());
			this.#game.turn = Turn.Player;
		}

		if (this.#game.player.state === PlayState.Stand) {
			this.endTurn();
			this.socket.next(this.#game);
			return;
		}

		this.socket.next(this.#game);
	}

	// calculate sum of cards in grid
	gridSum(grid: Card[]) {
		// TODO: manage reducing and multiplicative cards (-n, *n, /n)
		return grid.reduce((acc, card) => acc + card.value, 0);
	}
}

export const pazaak = new Pazaak();
