export interface Test2 {
  another: string;
}

export class Test2Worker implements Test2 {
  another: 'worker';
}

export class Test2Browser implements Test2 {
  another: 'browser';
}

export class Test2Mobile implements Test2 {
  another: 'mobile';
}
