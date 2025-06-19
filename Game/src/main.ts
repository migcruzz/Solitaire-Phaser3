import {Deck} from './gameLogic/Deck';
import {Card} from './gameLogic/Card';

export function runTests(): void {
    console.log('--- Running Solitaire Tests ---');
    testDeckCreation();
    testDrawAndDiscard();
    testShuffle();
    testRecycle();
    testToString();
    console.log('--- All tests completed ---');
}

function testDeckCreation(): void {
    const deck = new Deck();
    console.group('testDeckCreation');
    console.assert(deck.cards.length === 52, 'Deck should contain 52 cards');
    console.assert(deck.drawPile.length === 52, 'Draw pile should start with 52 cards');
    console.assert(deck.discardPile.length === 0, 'Discard pile should start empty');
    console.log('Deck creation tests passed');
    console.groupEnd();
}

function testDrawAndDiscard(): void {
    const deck = new Deck();
    console.group('testDrawAndDiscard');
    const drawn: Card[] = [];
    for (let i = 0; i < 5; i++) {
        const card = deck.draw();
        console.assert(card !== undefined, 'Drawn card should not be undefined');
        if (card) {
            drawn.push(card);
            deck.discardPile;
        }
    }
    console.assert(deck.drawPile.length === 47, 'After drawing 5, draw pile should have 47 cards');
    console.assert(drawn.length === 5, 'Should have drawn 5 cards');
    console.log('Draw and discard tests passed');
    console.groupEnd();
}

function testShuffle(): void {
    const deck = new Deck();
    console.group('testShuffle');
    const original = [...deck.drawPile];
    deck.shuffle();
    const shuffled = deck.drawPile;
    const isDifferent = original.some((card, idx) => card !== shuffled[idx]);
    console.assert(isDifferent, 'Shuffled draw pile should differ from original order');
    console.log('Shuffle tests passed');
    console.groupEnd();
}

function testRecycle(): void {
    const deck = new Deck();
    console.group('testRecycle');
    const discard: Card[] = [];
    for (let i = 0; i < 3; i++) {
        const card = deck.draw();
        if (card) discard.push(card);
    }
    (deck as any).discardPile = discard;
    deck.reset();
    console.assert(deck.drawPile.length === 52, 'After recycling, draw pile should have 52 cards');
    console.assert(deck.discardPile.length === 0, 'Discard pile should be empty after recycling');
    console.log('Recycle tests passed');
    console.groupEnd();
}

function testToString(): void {
    console.group('testToString');
    const card = new Card('HEART', 1, true);
    const str = card.toString();
    console.assert(typeof str === 'string', 'toString should return a string');
    console.assert(str.includes('HEART'), 'String should include the suit');
    console.assert(str.includes('1'), 'String should include the value');
    console.log('toString tests passed');
    console.groupEnd();
}

runTests();
