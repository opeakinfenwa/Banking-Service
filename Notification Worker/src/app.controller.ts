import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  TransactionCompletedEvent,
  TransactionFailedEvent,
  AccountFundedPayload,
} from './interfaces/interfaces';

@Controller()
export class AppController {
  @MessagePattern('TransactionCompleted')
  handleCompleted(@Payload() message: TransactionCompletedEvent) {
    console.log(
      `[Notification] Transaction completed for user ${message.userId}, Amount: ₦${message.amount}`,
    );
  }

  @MessagePattern('TransactionFailed')
  handleFailed(@Payload() message: TransactionFailedEvent) {
    console.log(
      `[Notification] Transaction failed for user ${message.userId}, Reason: ${message.reason}`,
    );
  }

  @MessagePattern('AccountFunded')
  handleFunded(@Payload() message: AccountFundedPayload) {
    console.log(
      `[Notification] Account ${message.accountNumber} funded by user ${message.userId}, Amount: ₦${message.amount}, New Balance: ₦${message.balance}`,
    );
  }
}