export abstract class BaseCommand {
  public abstract name: string
  public abstract description: string
  public abstract usage: string
  public abstract aliases: string[]
  public abstract execute(argv: string[]): void
}
