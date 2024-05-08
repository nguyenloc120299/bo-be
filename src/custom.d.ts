// custom.d.ts
declare module NodeJS {
    interface Global {
      io: any; // Định nghĩa kiểu của biến global io ở đây, bạn có thể thay any bằng kiểu cụ thể nếu bạn muốn.
    }
  }
  