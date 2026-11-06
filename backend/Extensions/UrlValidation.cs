namespace PartyUp.Extensions;

public static class UrlValidation
{
    public static bool TryNormalizeHttpUrl(string? value, out string url)
    {
        url = string.Empty;

        if (string.IsNullOrWhiteSpace(value))
        {
            return false;
        }

        var trimmed = value.Trim();

        if (!Uri.TryCreate(trimmed, UriKind.Absolute, out var parsedUrl)
            || (parsedUrl.Scheme != Uri.UriSchemeHttps
                && parsedUrl.Scheme != Uri.UriSchemeHttp))
        {
            return false;
        }

        url = trimmed;
        return true;
    }
}
