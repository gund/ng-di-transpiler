export interface Test1 {
  something: string;
}

export class Test1Worker implements Test1 {
  something = 'worker';
}

export class Test1Browser implements Test1 {
  something = 'browser';
}

export class Test1Mobile implements Test1 {
  something = 'mobile';
}
