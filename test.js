// SAVES EMAIL TO DATABASE
await createEmail(processedEmail, sender, sub);
        } catch (err) {
          console.error(
            `GETEMAIL: 90 Failed to get attachment properties: ${err}`,
          );
          await sendDenial(sender, sub, err);
        }
      } else {
        console.log(`NOT MATCH: ${sbjt} || ${attSubject}`);
      }
    }
  } catch (err) {
    console.error('Failed to get email:', err.message);
    await sendDenial(sender, sub, err);
    throw err;
  }
  return token;
};