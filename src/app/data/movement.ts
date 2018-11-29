export class Movement {
    public AgentId: string;
    public From: string;
    public To: string;
    public EdgeId: string;
    constructor() { }

    IsSamePosition(): Boolean {
        return String(this.From) === String(this.To);
    }
}
