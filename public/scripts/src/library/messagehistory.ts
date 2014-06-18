class messagehistory<T> {

    private index: number;
    private items: T[];

    constructor(private maxLength = 100) {
        this.items = [];
    }

    ///Add item to the end of the history
    add(item: T): messagehistory<T> {
        this.items.push(item);

        //Prune end of list
        if (this.items.length > this.maxLength)
            this.items.shift();

        return this.reset();
    }

    ///Move up
    up(): T {
        if (this.index == 0)
            this.index = 1;

        return this.items[--this.index];
    }

    ///Move down
    down(): T {
        if (this.index == this.items.length)
            return;

        return this.items[++this.index];
    }

    ///Reset index
    reset(): messagehistory<T> {
        this.index = this.items.length;
        return this;
    }

}