export class Heap<T> {
  private heap: T[] = [];
  private compare: (a: T, b: T) => boolean;
  private heapSize: number = 0;

  constructor(
    heapValue?: T,
    compare: (a: T, b: T) => boolean = (a, b) => a < b
  ) {
    if (heapValue) {
      this.heap.push(heapValue);
      this.heapSize = 1;
    }
    this.compare = compare;
    this.buildHeap;
  }

  private buildHeap(): void {
    if (this.heapSize <= 1) return;
    const parentIndx = Math.floor((this.heapSize - 2) / 2);
    for (let currIndx = parentIndx; currIndx >= 0; currIndx--) {
      this.__shiftDown(currIndx);
    }
  }

  private __shiftUp(currIndx: number): void {
    let parentIndx = Math.floor((currIndx - 1) / 2);
    while (
      currIndx > 0 &&
      this.compare(this.heap[currIndx], this.heap[parentIndx])
    ) {
      this.__swap(currIndx, parentIndx);
      currIndx = parentIndx;
      parentIndx = Math.floor((currIndx - 1) / 2);
    }
  }

  private __shiftDown(currIndx: number): void {
    let childOneIndx = currIndx * 2 + 1;
    while (childOneIndx <= this.heapSize - 1) {
      const childTwoIndx =
        currIndx * 2 + 2 <= this.heapSize - 1 ? currIndx * 2 + 2 : -1;
      let indxToSwap;
      if (
        childTwoIndx != -1 &&
        this.compare(this.heap[childTwoIndx], this.heap[childOneIndx])
      ) {
        indxToSwap = childTwoIndx;
      } else indxToSwap = childOneIndx;

      if (this.compare(this.heap[indxToSwap], this.heap[currIndx])) {
        this.__swap(indxToSwap, currIndx);
        currIndx = indxToSwap;
        childOneIndx = currIndx * 2 + 1;
      } else return;
    }
  }

  public top(): any {
    return this.heapSize > 0 ? this.heap[0] : -1;
  }

  public pop(): any {
    const top = this.heap[0];
    this.__swap(0, this.heapSize - 1);
    this.heapSize--;
    this.heap.pop();
    this.__shiftDown(0);
    return top;
  }

  public Length = (): number => {
    return this.heapSize;
  };

  private __swap(i: number, j: number) {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }
}

export enum HeapType {
  Min,
  Max,
}
