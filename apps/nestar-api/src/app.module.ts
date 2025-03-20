import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {ConfigModule} from '@nestjs/config';
import {GraphQLModule} from "@nestjs/graphql";
import {ApolloDriver} from "@nestjs/apollo"
import { AppResolver } from './app.resolver';
import { ComponentsModule } from './components/components.module';
import { DatabaseModule } from './database/database.module';
import { T } from './libs/types/common';

@Module({
  imports:[
    ConfigModule.forRoot(),// env ni uqish uchun
    GraphQLModule.forRoot({ // GraphQL API server xosil qiladi
      driver: ApolloDriver,
      playground: true,
      uploads: false,
      autoSchemaFile: true,
      formatError: (error: T) => { // Globall error hosil qilamiz -- resolverlarda xosil bulgan errorlarni qulga olamiz
        const graphQLFormattedError = { 
          code: error?.extensions.code,
          message: error?.extensions?.exception?.message || error?.extensions?.response?.message || error?.message ,
        };
        console.log("GRAPHQL GLOBAL ERROR:", graphQLFormattedError);
        return graphQLFormattedError; // return qilmasa server qotib qoladi 
      }
    }), ComponentsModule,
     DatabaseModule
  ], 
  controllers: [AppController], // Rest API server sifatida ham run buladi
  providers: [AppService, AppResolver], //GraphQL  API server sifatida ham run buladi
})
export class AppModule {}
