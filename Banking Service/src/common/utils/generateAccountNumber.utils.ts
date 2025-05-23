export function generateRandomAccountNumber(length: number): string {
  let accountNumber = '';
  for (let i = 0; i < length; i++) {
    accountNumber += Math.floor(Math.random() * 10);
  }
  return accountNumber;
}