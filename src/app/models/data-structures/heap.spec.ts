import { Heap } from './heap';

describe('Heap', () => {
  it('should generate and extract element in Min Heap order', () => {
    const minHeap = new Heap<number>(1);
    expect(minHeap.Length()).toBe(1);
  });
  it('should create an instance', () => {
    expect(new Heap()).toBeTruthy();
  });
  it('Should work for Pair', () => {
    type Pair<T, U> = {
      first: T;
      second: U;
    };

    function comp(a: [string, number], b: [string, number]): boolean {
      return a[1] < b[1];
    }

    var pq = new Heap<[string, number]>(undefined, comp);
    expect(pq.top()).toBe(-1);
    pq.push(['first', 0]);
    expect(pq.top()[1]).toBe(0);
    pq.push(['second', 2]);
    pq.pop();
    expect(pq.top()).toEqual(['second', 2]);
  });
});
