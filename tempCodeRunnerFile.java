public class DiaDosNamorados {
    public static void main(String[] args) {
        String nome = "Maycon";
        
        // 1. Desenha o coração no terminal
        System.out.println("   ****** ****** ");
        System.out.println(" ** ** ** ** ");
        System.out.println("** *** **");
        System.out.println("** **");
        System.out.println(" ** ** ");
        System.out.println("   ** ** ");
        System.out.println("     ** ** ");
        System.out.println("       ** ** ");
        System.out.println("         ** ** ");
        System.out.println("           *** ");
        System.out.println("            * \n");

        // 2. Mensagem especial com efeito de digitação
        String mensagem = "Compilado com sucesso...\n"
                        + "Procurando referências de afeto...\n"
                        + "Estrutura encontrada!\n\n"
                        + "Feliz Dia dos Namorados, " + nome + "! ☕❤️\n"
                        + "Meu amor por você é como um loop infinito: "
                        + "não tem fim e consome todo o meu processamento.";

        efeitoDigitacao(mensagem);
    }

    // Método para fazer o texto aparecer aos poucos no terminal
    public static void efeitoDigitacao(String texto) {
        for (char caractere : texto.toCharArray()) {
            System.out.print(caractere);
            try {
                Thread.sleep(40); // Pausa de 40 milissegundos entre cada letra
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
        System.out.println();
    }
}