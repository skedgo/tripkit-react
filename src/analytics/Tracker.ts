import { ACTION_COMPUTE_TRIPS, ACTION_PICK_FROM_LOCATION, ACTION_PICK_TO_LOCATION, ACTION_SELECT_TIME_PREF, ACTION_TRIP_DETAILS } from './GATracker';

const eventNames = [
    ACTION_COMPUTE_TRIPS,
    ACTION_PICK_FROM_LOCATION,
    ACTION_PICK_TO_LOCATION,
    ACTION_SELECT_TIME_PREF,
    ACTION_TRIP_DETAILS
] as const;

type TrackEventName = typeof eventNames[number];

export type TrackEvent = {
    name: TrackEventName
    payload?: Payload;
}

export type Payload = {
    [x: string]: any;
};

// eventBus.ts
type Handler = (event: TrackEvent) => void;

class Tracker {

    listeners: Partial<Record<TrackEventName, Handler[]>> = {};

    public event(eventName: TrackEventName, payload?: Payload) {
        (this.listeners[eventName] || []).forEach(handler => handler({ name: eventName, payload }));
    }

    public subscribe(eventName: TrackEventName, handler: Handler) {
        if (!this.listeners[eventName]) {
            this.listeners[eventName] = [];
        }
        this.listeners[eventName].push(handler);
        // Return unsubscribe function
        return {
            unsubscribe: () => {
                this.listeners[eventName] = this.listeners[eventName]?.filter(h => h !== handler);
            }
        };
    }

    public subscribeAll(handler: Handler) {
        const unsubscribes = eventNames.map(eventName => this.subscribe(eventName, handler));
    }

}

const tracker = new Tracker();

export default tracker;