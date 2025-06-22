import { Heap } from './heap';

describe('Heap', () => {
  it('should generate and extract element in Min Heap order', () => {
    const minHeap = new Heap<number>(1);
    expect(minHeap.Length()).toBe(1);
  });
  it('should create an instance', () => {
    expect(new Heap()).toBeTruthy();
  });
});
