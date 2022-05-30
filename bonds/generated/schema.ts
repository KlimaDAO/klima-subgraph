// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class DailyBond extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("timestamp", Value.fromBigInt(BigInt.zero()));
    this.set("token", Value.fromString(""));
    this.set("payout", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("daoIncome", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("tokenValue", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("carbonCustodied", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("BCV", Value.fromBigInt(BigInt.zero()));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save DailyBond entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type DailyBond must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("DailyBond", id.toString(), this);
    }
  }

  static load(id: string): DailyBond | null {
    return changetype<DailyBond | null>(store.get("DailyBond", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get timestamp(): BigInt {
    let value = this.get("timestamp");
    return value!.toBigInt();
  }

  set timestamp(value: BigInt) {
    this.set("timestamp", Value.fromBigInt(value));
  }

  get token(): string {
    let value = this.get("token");
    return value!.toString();
  }

  set token(value: string) {
    this.set("token", Value.fromString(value));
  }

  get payout(): BigDecimal {
    let value = this.get("payout");
    return value!.toBigDecimal();
  }

  set payout(value: BigDecimal) {
    this.set("payout", Value.fromBigDecimal(value));
  }

  get daoIncome(): BigDecimal {
    let value = this.get("daoIncome");
    return value!.toBigDecimal();
  }

  set daoIncome(value: BigDecimal) {
    this.set("daoIncome", Value.fromBigDecimal(value));
  }

  get tokenValue(): BigDecimal {
    let value = this.get("tokenValue");
    return value!.toBigDecimal();
  }

  set tokenValue(value: BigDecimal) {
    this.set("tokenValue", Value.fromBigDecimal(value));
  }

  get carbonCustodied(): BigDecimal {
    let value = this.get("carbonCustodied");
    return value!.toBigDecimal();
  }

  set carbonCustodied(value: BigDecimal) {
    this.set("carbonCustodied", Value.fromBigDecimal(value));
  }

  get BCV(): BigInt {
    let value = this.get("BCV");
    return value!.toBigInt();
  }

  set BCV(value: BigInt) {
    this.set("BCV", Value.fromBigInt(value));
  }
}

export class Bonder extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("totalKlimaBonded", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("totalCarbonCustodied", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("totalKlimaMintedForDao", Value.fromBigDecimal(BigDecimal.zero()));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Bonder entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Bonder must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("Bonder", id.toString(), this);
    }
  }

  static load(id: string): Bonder | null {
    return changetype<Bonder | null>(store.get("Bonder", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get deposits(): Array<string> | null {
    let value = this.get("deposits");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toStringArray();
    }
  }

  set deposits(value: Array<string> | null) {
    if (!value) {
      this.unset("deposits");
    } else {
      this.set("deposits", Value.fromStringArray(<Array<string>>value));
    }
  }

  get redeems(): Array<string> | null {
    let value = this.get("redeems");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toStringArray();
    }
  }

  set redeems(value: Array<string> | null) {
    if (!value) {
      this.unset("redeems");
    } else {
      this.set("redeems", Value.fromStringArray(<Array<string>>value));
    }
  }

  get totalKlimaBonded(): BigDecimal {
    let value = this.get("totalKlimaBonded");
    return value!.toBigDecimal();
  }

  set totalKlimaBonded(value: BigDecimal) {
    this.set("totalKlimaBonded", Value.fromBigDecimal(value));
  }

  get totalCarbonCustodied(): BigDecimal {
    let value = this.get("totalCarbonCustodied");
    return value!.toBigDecimal();
  }

  set totalCarbonCustodied(value: BigDecimal) {
    this.set("totalCarbonCustodied", Value.fromBigDecimal(value));
  }

  get totalKlimaMintedForDao(): BigDecimal {
    let value = this.get("totalKlimaMintedForDao");
    return value!.toBigDecimal();
  }

  set totalKlimaMintedForDao(value: BigDecimal) {
    this.set("totalKlimaMintedForDao", Value.fromBigDecimal(value));
  }
}

export class Deposit extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("token", Value.fromString(""));
    this.set("transaction", Value.fromString(""));
    this.set("bonder", Value.fromString(""));
    this.set("payout", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("daoIncome", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("bondPrice", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("marketPrice", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("discount", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("tokenValue", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("carbonCustodied", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("timestamp", Value.fromBigInt(BigInt.zero()));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Deposit entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Deposit must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("Deposit", id.toString(), this);
    }
  }

  static load(id: string): Deposit | null {
    return changetype<Deposit | null>(store.get("Deposit", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get token(): string {
    let value = this.get("token");
    return value!.toString();
  }

  set token(value: string) {
    this.set("token", Value.fromString(value));
  }

  get transaction(): string {
    let value = this.get("transaction");
    return value!.toString();
  }

  set transaction(value: string) {
    this.set("transaction", Value.fromString(value));
  }

  get bonder(): string {
    let value = this.get("bonder");
    return value!.toString();
  }

  set bonder(value: string) {
    this.set("bonder", Value.fromString(value));
  }

  get payout(): BigDecimal {
    let value = this.get("payout");
    return value!.toBigDecimal();
  }

  set payout(value: BigDecimal) {
    this.set("payout", Value.fromBigDecimal(value));
  }

  get daoIncome(): BigDecimal {
    let value = this.get("daoIncome");
    return value!.toBigDecimal();
  }

  set daoIncome(value: BigDecimal) {
    this.set("daoIncome", Value.fromBigDecimal(value));
  }

  get bondPrice(): BigDecimal {
    let value = this.get("bondPrice");
    return value!.toBigDecimal();
  }

  set bondPrice(value: BigDecimal) {
    this.set("bondPrice", Value.fromBigDecimal(value));
  }

  get marketPrice(): BigDecimal {
    let value = this.get("marketPrice");
    return value!.toBigDecimal();
  }

  set marketPrice(value: BigDecimal) {
    this.set("marketPrice", Value.fromBigDecimal(value));
  }

  get discount(): BigDecimal {
    let value = this.get("discount");
    return value!.toBigDecimal();
  }

  set discount(value: BigDecimal) {
    this.set("discount", Value.fromBigDecimal(value));
  }

  get tokenValue(): BigDecimal {
    let value = this.get("tokenValue");
    return value!.toBigDecimal();
  }

  set tokenValue(value: BigDecimal) {
    this.set("tokenValue", Value.fromBigDecimal(value));
  }

  get carbonCustodied(): BigDecimal {
    let value = this.get("carbonCustodied");
    return value!.toBigDecimal();
  }

  set carbonCustodied(value: BigDecimal) {
    this.set("carbonCustodied", Value.fromBigDecimal(value));
  }

  get timestamp(): BigInt {
    let value = this.get("timestamp");
    return value!.toBigInt();
  }

  set timestamp(value: BigInt) {
    this.set("timestamp", Value.fromBigInt(value));
  }
}

export class Redemption extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("bonder", Value.fromString(""));
    this.set("payout", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("payoutRemaining", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("timestamp", Value.fromBigInt(BigInt.zero()));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Redemption entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Redemption must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("Redemption", id.toString(), this);
    }
  }

  static load(id: string): Redemption | null {
    return changetype<Redemption | null>(store.get("Redemption", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get transaction(): string | null {
    let value = this.get("transaction");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toString();
    }
  }

  set transaction(value: string | null) {
    if (!value) {
      this.unset("transaction");
    } else {
      this.set("transaction", Value.fromString(<string>value));
    }
  }

  get bonder(): string {
    let value = this.get("bonder");
    return value!.toString();
  }

  set bonder(value: string) {
    this.set("bonder", Value.fromString(value));
  }

  get token(): string | null {
    let value = this.get("token");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toString();
    }
  }

  set token(value: string | null) {
    if (!value) {
      this.unset("token");
    } else {
      this.set("token", Value.fromString(<string>value));
    }
  }

  get payout(): BigDecimal {
    let value = this.get("payout");
    return value!.toBigDecimal();
  }

  set payout(value: BigDecimal) {
    this.set("payout", Value.fromBigDecimal(value));
  }

  get payoutRemaining(): BigDecimal {
    let value = this.get("payoutRemaining");
    return value!.toBigDecimal();
  }

  set payoutRemaining(value: BigDecimal) {
    this.set("payoutRemaining", Value.fromBigDecimal(value));
  }

  get timestamp(): BigInt {
    let value = this.get("timestamp");
    return value!.toBigInt();
  }

  set timestamp(value: BigInt) {
    this.set("timestamp", Value.fromBigInt(value));
  }
}

export class Transaction extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("timestamp", Value.fromBigInt(BigInt.zero()));
    this.set("blockNumber", Value.fromBigInt(BigInt.zero()));
    this.set("from", Value.fromBytes(Bytes.empty()));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Transaction entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Transaction must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("Transaction", id.toString(), this);
    }
  }

  static load(id: string): Transaction | null {
    return changetype<Transaction | null>(store.get("Transaction", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get timestamp(): BigInt {
    let value = this.get("timestamp");
    return value!.toBigInt();
  }

  set timestamp(value: BigInt) {
    this.set("timestamp", Value.fromBigInt(value));
  }

  get blockNumber(): BigInt {
    let value = this.get("blockNumber");
    return value!.toBigInt();
  }

  set blockNumber(value: BigInt) {
    this.set("blockNumber", Value.fromBigInt(value));
  }

  get from(): Bytes {
    let value = this.get("from");
    return value!.toBytes();
  }

  set from(value: Bytes) {
    this.set("from", Value.fromBytes(value));
  }

  get to(): Bytes | null {
    let value = this.get("to");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBytes();
    }
  }

  set to(value: Bytes | null) {
    if (!value) {
      this.unset("to");
    } else {
      this.set("to", Value.fromBytes(<Bytes>value));
    }
  }
}
