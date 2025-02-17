> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [stackoverflow.com](https://stackoverflow.com/questions/38416593/why-should-edx-be-0-before-using-the-div-instruction)

I noticed when EDX contains some random default value like 00401000, and I then use a DIV instruction like this:

```
mov eax,10
mov ebx,5
div ebx
```

it causes an INTEGER OVERFLOW ERROR. However, if I set `edx` to 0 and do the same thing it works. I believed that using `div` would result in the quotient overwriting `eax` and the remainder overwriting `edx`.

Getting this INTEGER OVERFLOW ERROR really confuses me.

 

### What to do

For 32-bit / 32-bit => 32-bit division: zero- or sign-extend the 32-bit dividend from EAX into 64-bit EDX: EAX.  
For 16-bit, AX into DX: AX with `cwd` or xor-zeroing.

*   unsigned: `XOR EDX,EDX` then `DIV divisor`
*   signed: `CDQ` then `IDIV divisor`

See also [When and why do we sign extend and use cdq with mul/div?](https://stackoverflow.com/questions/36464879/when-and-why-do-we-sign-extend-and-use-cdq-with-mul-div)

* * *

### Why (TL; DR)

For [`DIV`](http://www.felixcloutier.com/x86/DIV.html), the registers `EDX` and `EAX` form one single 64 bit value (often shown as `EDX:EAX`), which is then divided, in this case, by `EBX`.

So if `EAX` = `10` or hex `A` and `EDX` is, say `20` or hex `14`, then together they form the 64 bit value hex `14 0000 000A` or decimal `85899345930`. If this is divided by `5`, the result is `17179869186` or hex  
`4 0000 0002`, **which is a value that does not fit in 32 bits**.

**That is why you get an integer overflow.**

If, however, `EDX` were only `1`, you would divide hex `1 0000 000A` by `5`, which results in hex  
`3333 3335`. That is not the value you wanted, but it does not cause an integer overflow.

To really divide 32 bit register `EAX` by another 32 bit register, take care that the top of the 64 bit value formed by `EDX:EAX` is `0`.

So, **before** a single division, you should _generally_ set `EDX` to `0`.

(Or for signed division, `cdq` to sign extend `EAX` into `EDX:EAX` before `idiv`)

* * *

But `EDX` does not have always have to be `0`. It can just not be that big that the result causes an overflow.

One example from my `BigInteger` code:

After a division with `DIV`, the quotient is in `EAX` and the remainder is in `EDX`. To divide something like a `BigInteger`, which consists of an array of many `DWORDS`, by `10` (for instance to convert the value to a decimal string), you do something like the following:

```
; ECX contains number of "limbs" (DWORDs) to divide by 10
    XOR     EDX, EDX      ; before start of loop, set EDX to 0
    MOV     EBX, 10
    LEA     ESI,[EDI + 4*ECX - 4] ; now points to top element of array
@DivLoop:
    MOV     EAX,[ESI]
    DIV     EBX          ; divide EDX: EAX by EBX. After that,
                         ; quotient in EAX, remainder in EDX
    MOV     [ESI], EAX
    SUB     ESI, 4        ; remainder in EDX is re-used as top DWORD... 
    DEC     ECX          ; ... for the next iteration, and is NOT set to 0.
    JNE     @DivLoop
```

After that loop, the value represented by the entire array (i.e. by the `BigInteger`) is divided by `10`, and `EDX` contains the remainder of that division.

_FWIW, in the assembler I use (Delphi's built-in assembler), labels starting with `@` are local to the function, i.e. they don't interfere with equally named labels in other functions._

 

The DIV instruction divides EDX: EAX by the r/m 32 that follows the DIV instruction. So, if you fail to set EDX to zero, the value you are using becomes extremely large.

Trust that helps