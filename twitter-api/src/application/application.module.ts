import { Module } from '@nestjs/common';
import { DomainModule } from '../domain/domain.module';
import { UserUseCasesModule } from './use-cases/user.use-cases.module';
import { TweetUseCasesModule } from './use-cases/tweet.use-cases.module';

@Module({
  imports: [DomainModule, UserUseCasesModule, TweetUseCasesModule],
  providers: [],
  exports: [UserUseCasesModule, TweetUseCasesModule],
})
export class ApplicationModule {}
