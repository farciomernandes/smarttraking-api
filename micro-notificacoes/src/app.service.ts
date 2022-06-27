import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Desafio } from './interfaces/desafio.interface';
import { Jogador } from './interfaces/jogador.interface';
import { ClientProxySmartRanking } from './proxyrmq/client-proxy';
import HTML_NOTIFICACAO_ADVERSARIO from './static/html-notificacao-adversaio';

@Injectable()
export class AppService {

  constructor(
    private clientProxySmartRanking: ClientProxySmartRanking,
    private readonly mailService: MailerService
  ){}

  private logger = new Logger(AppService.name);

  private clientAdminBackend = this.clientProxySmartRanking.getClientProxyAdminBackendInstance();

  async enviarEmailParaAdversario(desafio: Desafio): Promise<void> {



    try {

      let idAdversario = '';

      desafio.jogadores.map(jogador=> {
        if(jogador != desafio.solicitante){
          idAdversario = jogador;
        }
      } );

      const adversario: Jogador = await this.clientAdminBackend
      .send('consultar-jogadores', idAdversario).toPromise();

      const solicitante: Jogador = await this.clientAdminBackend
      .send('consultar-jogadores', desafio.solicitante).toPromise();

      let markup = '';
      markup = HTML_NOTIFICACAO_ADVERSARIO;
      markup.replace(/#NOME_ADVERSARIO/g, adversario.nome);
      markup.replace(/#NOME_SOLICITANTE/g, solicitante.nome);


      this.mailService.sendMail({
        to: adversario.email,
        from: `"SMART RANKING" <api.smartranking_marcio@gmail.com>`,
        subject: "Solicitação de Desafio",
        html: markup
      }).then(success=>{
        this.logger.log(success);
      }).catch(error=>{
        this.logger.log(error);
      });

    } catch (error) {
      this.logger.log(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }
}
